const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getRecruiterProfile = async (req, res) => {
  try {
    const profile = await prisma.recruiterProfile.findUnique({
      where: {
        userId: req.user.userId,
      },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

const getCompanyByName = async (req, res) => {
  try {
    const { companyName } = req.params;
    const company = await prisma.recruiterProfile.findFirst({
      where: {
        companyName: {
          equals: companyName,
          mode: "insensitive",
        },
      },
    });

    if (!company) {
      return res.status(404).json({
        error: "Company Not Found!",
      });
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
};

const updateRecruiterProfile = async (req, res) => {
  try {
    const { companyName, industry, companySize, companyDescription, location } =
      req.body;

    const updatedProfile = await prisma.recruiterProfile.update({
      where: {
        userId: req.user.userId,
      },
      data: {
        companyName,
        industry,
        companySize,
        companyDescription,
        location,
      },
    });

    res.json(updatedProfile);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// In your recruiter controller
const getApplicantsAfterApply = async (req, res) => {
  try {
    // Dapatkan recruiter profile berdasarkan userId dari token
    const recruiterProfile = await prisma.recruiterProfile.findUnique({
      where: {
        userId: req.user.userId
      }
    });

    if (!recruiterProfile) {
      return res.status(404).json({ 
        error: "Recruiter profile not found" 
      });
    }

    const applicants = await prisma.jobApplication.findMany({
      where: {
        jobPosting: {
          recruiterId: recruiterProfile.id // Gunakan ID dari profile yang ditemukan
        }
      },
      include: {
        applicant: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        jobPosting: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(applicants);
  } catch (error) {
    console.error('Error fetching applicants:', error);
    res.status(500).json({ error: 'Failed to fetch applicants' });
  }
};

// In your recruiter controller
const updateApplicationStatus = async (req, res) => {
  try {
      const { applicationId } = req.params;
      const { status } = req.body;
      const recruiterId = req.user.recruiterId;

      // Verify the application belongs to the recruiter
      const application = await prisma.jobApplication.findUnique({
          where: { id: parseInt(applicationId) },
          include: { 
              jobPosting: {
                  select: {
                    recruiter: {
                      recruiterId
                    }
                  }
              }
          }
      });

      if (!application || application.jobPosting.recruiterId !== recruiterId) {
          return res.status(403).json({ error: 'Unauthorized to update this application' });
      }

      // Update the application status
      const updatedApplication = await prisma.jobApplication.update({
          where: { id: parseInt(applicationId) },
          data: { status }
      });

      res.json(updatedApplication);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update application status' });
  }
};

const getDashboardOverview = async (req, res) => {
  try {
    // Dapatkan recruiter profile terlebih dahulu
    const recruiterProfile = await prisma.recruiterProfile.findUnique({
      where: {
        userId: req.user.userId
      }
    });

    if (!recruiterProfile) {
      return res.status(404).json({ error: "Recruiter profile not found" });
    }

    // Gunakan recruiterId dari profile
    const totalJobPosts = await prisma.jobPosting.count({
      where: {
        recruiterId: recruiterProfile.id
      },
    });

    const totalApplicants = await prisma.jobApplication.count({
      where: {
        jobPosting: {
          recruiterId: recruiterProfile.id
        },
      },
    });

    const recentActivity = await prisma.jobApplication.findMany({
      where: {
        jobPosting: {
          recruiterId: recruiterProfile.id
        },
      },
      include: {
        applicant: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        jobPosting: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    res.json({
      totalJobPosts,
      totalApplicants,
      recentActivity,
    });
  } catch (error) {
    console.error("Error fetching dashboard overview:", error);
    res.status(500).json({ error: "Failed to fetch dashboard overview" });
  }
};



module.exports = {
  getRecruiterProfile,
  updateRecruiterProfile,
  getCompanyByName,
  getApplicantsAfterApply,
  updateApplicationStatus,
  getDashboardOverview
};
