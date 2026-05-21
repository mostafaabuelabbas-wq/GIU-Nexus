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

// Maps lowercase bio text → canonical display name.
// Sorted longest-first so "tailwind css" matches before "tailwind",
// "node.js" before "node", etc.
const TECH_DISPLAY = Object.entries({
  "react native": "React Native",
  "tailwind css": "Tailwind CSS",
  "rest apis": "REST APIs",
  "rest api": "REST API",
  "node.js": "Node.js",
  "next.js": "Next.js",
  "vue.js": "Vue.js",
  "scikit-learn": "Scikit-learn",
  "mongodb": "MongoDB",
  "postgresql": "PostgreSQL",
  "typescript": "TypeScript",
  "javascript": "JavaScript",
  "tensorflow": "TensorFlow",
  "pytorch": "PyTorch",
  "graphql": "GraphQL",
  "tailwind": "Tailwind CSS",
  "nextjs": "Next.js",
  "nodejs": "Node.js",
  "vuejs": "Vue.js",
  "express": "Express",
  "angular": "Angular",
  "svelte": "Svelte",
  "python": "Python",
  "django": "Django",
  "fastapi": "FastAPI",
  "flutter": "Flutter",
  "docker": "Docker",
  "kubernetes": "Kubernetes",
  "firebase": "Firebase",
  "supabase": "Supabase",
  "redis": "Redis",
  "mysql": "MySQL",
  "sqlite": "SQLite",
  "kotlin": "Kotlin",
  "golang": "Go",
  "react": "React",
  "flask": "Flask",
  "spring": "Spring",
  "laravel": "Laravel",
  "swift": "Swift",
  "scala": "Scala",
  "pandas": "Pandas",
  "numpy": "NumPy",
  "opencv": "OpenCV",
  "nginx": "Nginx",
  "kafka": "Kafka",
  "figma": "Figma",
  "jest": "Jest",
  "vite": "Vite",
  "webpack": "Webpack",
  "rust": "Rust",
  "ruby": "Ruby",
  "azure": "Azure",
  "linux": "Linux",
  "html": "HTML",
  "sass": "Sass",
  "aws": "AWS",
  "gcp": "GCP",
  "git": "Git",
  "php": "PHP",
  "css": "CSS",
  "sql": "SQL",
  "c++": "C++",
  "c#": "C#",
}).sort((a, b) => b[0].length - a[0].length);

// WordPiece tokenization artifacts — never valid skills
const ARTIFACTS = new Set(["goDB", "oDB", "Mon"]);

function scanBioForSkills(bio) {
  const found = new Set();
  for (const [kw, display] of TECH_DISPLAY) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`(?<![\\w.])${escaped}(?![\\w.])`, "i").test(bio)) {
      found.add(display);
    }
  }
  return [...found];
}

const result = await hf.tokenClassification({
  model: "dslim/bert-base-NER",
  inputs: user.bio,
});

// NER: keep only MISC entities, strip WordPiece prefixes, drop artifacts
const nerSkills = [
  ...new Set(
    result
      .filter((e) => ["MISC", "B-MISC", "I-MISC"].includes(e.entity_group))
      .map((e) => e.word.replace(/^##/, ""))
      .filter((word) =>
        !ARTIFACTS.has(word) &&
        word.length > 2 &&
        /^[a-zA-Z0-9.+#-]+$/.test(word)
      )
  ),
];

// Direct bio scan catches ORG-tagged tech (MongoDB, Node.js, etc.) and
// multi-word phrases (Tailwind CSS, REST APIs) the NER model misses
const bioSkills = scanBioForSkills(user.bio);

const skills = [...new Set([...bioSkills, ...nerSkills])];

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
