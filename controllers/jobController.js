const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createJob = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        error: "User not authenticated",
      });
    }

    const {
      title,
      description,
      requirements,
      location,
      salary,
      employmentType,
    } = req.body;

    const recruiterProfile = await prisma.recruiterProfile.findUnique({
      where: {
        userId: req.user.userId,
      },
    });

    if (!recruiterProfile) {
      return res.status(404).json({ error: "Recruiter profile not found" });
    }

    const job = await prisma.jobPosting.create({
      data: {
        title,
        description,
        requirements,
        location,
        salary,
        employmentType,
        isActive: true,
        recruiterId: recruiterProfile.id,
      },
      include: {
        recruiter: {
          select: {
            companyName: true,
            industry: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllJobs = async (req, res) => {
  try {
    // Ambil query parameter dari request
    const { title, employmentType, salary, location } = req.query;

    // Buat kondisi dinamis untuk filter
    const filterConditions = {
      isActive: true, // Tetap hanya mengambil job yang aktif
    };

    // Tambahkan filter jika parameter ada
    if (title) {
      filterConditions.title = {
        contains: title, // Mencari substring di title
        mode: "insensitive", // Tidak case-sensitive
      };
    }

    if (employmentType && employmentType !== "all") {
      // Hanya terapkan filter jika employmentType bukan "all"
      filterConditions.employmentType = employmentType;
    }

    if (salary) {
      const salaryRange = salary.split('-');
      if (salaryRange.length === 2) {
        const minSalary = parseInt(salaryRange[0].trim(), 10);
        const maxSalary = parseInt(salaryRange[1].trim(), 10);
        filterConditions.salary = {
          gte: minSalary, // Gaji minimum
          lte: maxSalary, // Gaji maksimum
        };
      }
    }

    if (location) {
      filterConditions.location = {
        contains: location,
        mode: "insensitive",
      };
    }


    // Ambil data pekerjaan dari database
    const jobs = await prisma.jobPosting.findMany({
      where: filterConditions, // Terapkan filter dinamis
      include: {
        recruiter: {
          select: {
            companyName: true,
            companyLogo: true,
            industry: true,
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Urutkan berdasarkan waktu dibuat
      },
    });

    res.json({
      message: "Jobs retrieved successfully",
      jobs, // Tetap kembalikan data pekerjaan
    });
  } catch (error) {
    console.error("Error getting jobs:", error);
    res.status(500).json({
      error: "Error retrieving jobs",
    });
  }
};


const getRecruiterJobs = async (req, res) => {
  try {
    const recruiterProfile = await prisma.recruiterProfile.findUnique({
      where: {
        userId: req.user.userId,
      },
    });

    if (!recruiterProfile) {
      return res.status(404).json({
        error: "Recruiter profile not found",
      });
    }

    const job = await prisma.jobPosting.findMany({
      where: {
        recruiterId: recruiterProfile.id,
      },
      include: {
        applications: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
        recruiter: {
          select: {
            companyName: true,
            industry: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      message: "Recruiter jobs retrieved successfully",
      job,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getJobByIdPublic = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await prisma.jobPosting.findFirst({
      where: {
        id: parseInt(jobId),
        isActive: true,  // Pastikan hanya mengambil job yang aktif
      },
      include: {
        recruiter: {
          select: {
            companyName: true,
            industry: true,
            companyLogo: true,
            location: true,
          },
        },
      },
    });

    if (!job) {
      return res.status(404).json({
        error: "Job posting not found",
      });
    }

    res.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({
      error: "Error fetching job posting",
    });
  }
};

const getJobById = async (req, res) => {
  try {
    // 1. Mengambil jobId dari parameter URL
    const { jobId } = req.params;

    // 2. Query ke database menggunakan Prisma
    const job = await prisma.jobPosting.findFirst({
      // Mencari job berdasarkan ID dan memastikan recruiter yang benar
      where: {
        id: parseInt(jobId), // Convert string ke integer
        recruiter: {
          userId: req.user.userId, // Pastikan job milik recruiter yang sedang login
        },
      },
      // Include relasi dan pilih field yang dibutuhkan
      include: {
        // Include data aplikasi untuk job ini
        applications: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            // Include data applicant untuk setiap aplikasi
            applicant: {
              select: {
                firstName: true,
                lastName: true,
                skills: true,
              },
            },
          },
        },
        // Include data recruiter/perusahaan
        recruiter: {
          select: {
            companyName: true,
            industry: true,
          },
        },
      },
    });

    // 3. Jika job tidak ditemukan atau bukan milik recruiter ini
    if (!job) {
      return res.status(404).json({
        error: "Job posting not found or unauthorized",
      });
    }

    // 4. Return job data
    res.json(job);
  } catch (error) {
    // 5. Error handling
    console.error("Error fetching job:", error);
    res.status(500).json({
      error: "Error fetching job posting",
    });
  }
};

const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const {
      title,
      description,
      requirements,
      location,
      salary,
      employmentType,
      isActive,
    } = req.body;

    const existingJob = await prisma.jobPosting.findFirst({
      where: {
        id: parseInt(jobId),
        recruiter: {
          userId: req.user.userId,
        },
      },
    });

    if (!existingJob) {
      return res.status(404).json({ error: "Job not found" });
    }

    const updateJob = await prisma.jobPosting.update({
      where: {
        id: parseInt(jobId),
      },
      data: {
        title,
        description,
        requirements,
        location,
        salary,
        employmentType,
        isActive,
        updatedAt: new Date(),
      },
      include: {
        recruiter: {
          select: {
            companyName: true,
            industry: true,
          },
        },
      },
    });

    res.json({
      message: "Job updated successfully",
      updateJob,
    });
  } catch (error) {
    console.error("Error Updating Job :", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const existingJob = await prisma.jobPosting.findFirst({
      where: {
        id: parseInt(jobId),
        recruiter: {
          userId: req.user.userId,
        },
      },
    });

    if (!existingJob) {
      return res.status(404).json({ error: "Job not found" });
    }

    await prisma.jobPosting.delete({
      where: {
        id: parseInt(jobId),
      },
    });

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllJobs,
  createJob,
  getRecruiterJobs,
  getJobById,
  getJobByIdPublic,
  updateJob,
  deleteJob
};
