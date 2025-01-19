const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerApplicant = async (req, res) => {
  try {
    const { email, password, firstName, lastName, skills } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: "APPLICANT",
          applicantProfile: {
            create: {
              firstName,
              lastName,
              skills: skills || [], // Default empty array jika skills tidak ada
            },
          },
        },
        include: {
          applicantProfile: true,
        },
      });

      return user;
    });

    // Create JWT token
    const token = jwt.sign(
      { userId: result.id, email: result.email, role: result.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "Applicant registered successfully",
      token,
      user: {
        id: result.id,
        email: result.email,
        role: result.role,
        profile: result.applicantProfile,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Error registering applicant" });
  }
};

const registerRecruiter = async (req, res) => {
  try {
    const { email, password, companyName, industry } = req.body;
    const companyLogo = req.file ? `/uploads/${req.file.filename}` : null;
    console.log({ email, password, companyName, industry, companyLogo });
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: "RECRUITER",
          recruiterProfile: {
            create: {
              companyName,
              industry,
              companyLogo,
            },
          },
        },
        include: {
          recruiterProfile: true,
        },
      });

      return user;
    });

    const token = jwt.sign(
      {
        userId: result.id,
        email: result.email,
        role: result.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "Recruiter registered successfully",
      token,
      user: {
        id: result.id,
        email: result.email,
        role: result.role,
        profile: result.recruiterProfile,
      },
    })
  } catch (error) {
    res.status(500).json({ error: "Error registering recruiter" });
  }
};

const loginUser = async (req,res) => {
  try {
    const { email, password } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      email,
    },
    include: {
      applicantProfile: true,
      recruiterProfile: true
    }
  })

  if (!user) {
    return res.status(401).json({
      error: "Invalid Credentials!"
    })
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({
      error: "Invalid Credentials!"
    })
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  const profile = user.role === 'APPLICANT' ? user.applicantProfile : user.recruiterProfile;
  const redirectUrl = user.role === 'APPLICANT' ? '/' : '/dashboard'

  res.status(200).json({
    message: "Login Success",
    token,
    redirectUrl,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      profile
    }
  })

  } catch (error) {
    res.status(500).json({
      error: "Login Error"
    })
  }
} 

module.exports = {
  registerApplicant,
  registerRecruiter,
  loginUser
};
