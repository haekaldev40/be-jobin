const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const applyJob = async (req, res) => {
    try {
        const { jobPostingId, coverLetter } = req.body;
        const userId = req.user.userId;
        const cvResume = req.file ? `/uploads/${req.file.filename}` : null;

        const applicantProfile = await prisma.applicantProfile.findUnique({
            where: { 
              userId: userId
             },
          });

        const job = await prisma.jobPosting.findUnique({
            where: {
                id: parseInt(jobPostingId)
            }
        })

        if(!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        const application = await prisma.jobApplication.create({
            data: {
                jobPosting: {
                    connect: {
                        id: parseInt(jobPostingId)
                    }
                },
                applicant: {
                    connect: {
                        id: applicantProfile.id
                    },
                },
                coverLetter,
                status: 'Pending',
                cvResume,
            }
        })

        res.status(201).json({
            message: "Application submitted successfully",
            application
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
        console.log(error)
    }
}

const getHistoryJob = async (req, res) => {
    try {
      const userId = req.user.userId;
  
      const applicantProfile = await prisma.applicantProfile.findUnique({
        where: {
          userId: userId,
        },
        include: {
          jobApplications: {
            include: {
              jobPosting: {
                include: {
                  recruiter: {
                    select: {
                        companyName: true,
                        companyLogo: true
                    }
                  },
                },
              },
            },
          },
        },
      });
  
      if (!applicantProfile) {
        return res.status(401).json({ error: "Unauthorized" });
      }
  
      const applications = applicantProfile.jobApplications;
      res.status(200).json({
        message: "Job applications retrieved successfully",
        applications,
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
      console.error(error);
    }
  };
  

module.exports = { 
    applyJob,
    getHistoryJob
}