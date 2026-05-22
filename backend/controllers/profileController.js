const User = require("../models/User");
const hf = require("../services/hfService");

exports.getProfile = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updates = {};

    const editableFields = [
      "name",
      "bio",
      "profilePicture",
      "phone",
      "university",
      "major",
      "resumeUrl",
      "linkedinUrl",
      "githubUrl",
      "portfolioUrl",
      "studentId",
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // If a profile picture was uploaded, its Cloudinary URL takes precedence
    if (req.file) {
      updates.profilePicture = req.file.path;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });

    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });

  } catch (error) {
    next(error);
  }
};

exports.extractSkills = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.bio) {
      return res.status(400).json({
        success: false,
        message: "Bio is empty. Update your profile first.",
      });
    }

const TECH_SKILLS = [
  'React', 'React Native', 'Vue.js', 'Angular', 'Next.js', 'Svelte', 'TypeScript', 'JavaScript',
  'Node.js', 'Express', 'Django', 'FastAPI', 'Flask', 'Spring', 'Laravel', 'Python', 'Go', 'Rust',
  'Kotlin', 'Swift', 'PHP', 'Ruby', 'Scala', 'C++', 'C#', 'Java',
  'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'SQL',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Linux', 'Git', 'Nginx', 'Kafka',
  'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'OpenCV',
  'GraphQL', 'REST API', 'Firebase', 'Supabase', 'Figma', 'Flutter',
  'HTML', 'CSS', 'Sass', 'Tailwind CSS', 'Webpack', 'Vite', 'Jest',
];

// WordPiece tokenization artifacts — never valid skills
const ARTIFACTS = new Set(["goDB", "oDB", "Mon"]);

// Zero-shot classify the bio against batches of tech skill candidates.
// multi_label=true means each skill gets an independent confidence score.
async function extractSkillsZeroShot(bio) {
  const BATCH_SIZE = 20;
  const THRESHOLD = 0.5;
  const found = new Set();
  for (let i = 0; i < TECH_SKILLS.length; i += BATCH_SIZE) {
    const batch = TECH_SKILLS.slice(i, i + BATCH_SIZE);
    const result = await hf.zeroShotClassification({
      model: 'facebook/bart-large-mnli',
      inputs: bio,
      parameters: { candidate_labels: batch, multi_label: true },
    });
    const labels = result.labels ?? [];
    const scores = result.scores ?? [];
    labels.forEach((label, idx) => {
      if (scores[idx] >= THRESHOLD) found.add(label);
    });
  }
  return [...found];
}

const [nerResult, zeroShotSkills] = await Promise.all([
  hf.tokenClassification({ model: 'dslim/bert-base-NER', inputs: user.bio }),
  extractSkillsZeroShot(user.bio),
]);

// NER: keep only MISC entities, strip WordPiece prefixes, drop artifacts
const nerSkills = [
  ...new Set(
    nerResult
      .filter((e) => ["MISC", "B-MISC", "I-MISC", "ORG", "B-ORG", "I-ORG"].includes(e.entity_group))
      .map((e) => e.word.replace(/^##/, ""))
      .filter((word) =>
        !ARTIFACTS.has(word) &&
        word.length > 2 &&
        /^[a-zA-Z0-9.+#-]+$/.test(word)
      )
  ),
];

const skills = [...new Set([...zeroShotSkills, ...nerSkills])];

    // Save extracted skills
    user.skills = skills;

    await user.save();

    // Cache the user's skills embedding for the recommendation engine
    try {
      const embResult = await hf.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: [skills.join(", ")],
      });
      await User.findByIdAndUpdate(user._id, { embedding: embResult[0] });
    } catch (embErr) {
      console.error("Failed to cache user embedding:", embErr.message);
    }

    res.status(200).json({
      success: true,
      skills: user.skills,
      extracted: skills,
    });
  } catch (error) {
    console.error("HF extraction failed:", error.message);

    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      skills: user?.skills || [],
      extracted: [],
      message: "AI extraction failed. Returning existing skills.",
    });
  }
};
