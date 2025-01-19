const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const getApplicantProfile = async (req, res) => {
    try {
      const { userId } = req.user; // Mendapatkan userId dari token yang sudah didecode
      console.log(userId);
      
      const profile = await prisma.applicantProfile.findUnique({
        where: { userId },
      });
  
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
  
      res.status(200).json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Error fetching profile" });
    }
};

// Memperbarui data profile applicant
const updateApplicantProfile = async (req, res) => {
    try {
      const { userId } = req.user; // Mendapatkan userId dari token
      const { firstName, lastName, phoneNumber, address, education, experience, skills, resume } = req.body;
  
      const updatedProfile = await prisma.applicantProfile.update({
        where: { userId },
        data: {
          firstName,
          lastName,
          phoneNumber,
          address,
          education,
          experience,
          skills: skills || [], // Update skills (default empty array jika tidak diisi)
          resume,
        },
      });
  
      res.status(200).json({
        message: "Profile updated successfully",
        profile: updatedProfile,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Error updating profile" });
    }
  };
  
  module.exports = { getApplicantProfile, updateApplicantProfile };  
  