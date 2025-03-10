import asyncHandler from "../middleware/asyncHandler.js";
import InstitutionEngagement from "../models/institutionEngagementModel.js";
import Institution from "../models/institutionModel.js";

// @desc    Get All Institution Engagements
// @route   GET /api/institution-engagements
// @access  Admin or Charity Admin
const getAllInstitutionEngagements = asyncHandler(async (req, res) => {
    try {
        let engagements;

        if (req.user.role !== "volunteer") {
            // If the user is a volunteer, filter by their institution
            engagements = await InstitutionEngagement.find({ institution: req.user.institution });
        } else {
            // Otherwise, return all engagements
            engagements = await InstitutionEngagement.find();
        }

        res.status(200).json({
            success: true,
            message: "Institution engagements fetched successfully!",
            data: engagements,
        });
    } catch (error) {
        console.error("Error fetching institution engagements:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});


// @desc    Get All Institution Engagements
// @route   GET /api/institution-engagements
// @access  Admin or Charity Admin
const getAllInstitutions = asyncHandler(async (req, res) => {
    try {
        let institution;

        if (req.user.role !== "volunteer") {
            // If the user is a volunteer, filter by their institution
            institution = await Institution.find({ _id: req.user.institution }).populate('events');
        } else {
            // Otherwise, return all engagements
            institution = await Institution.find().populate('events');
        }

        res.status(200).json({
            success: true,
            message: "Institutions fetched successfully!",
            data: institution,
        });
    } catch (error) {
        console.error("Error fetching institutions:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

// @desc    Create a New Institution Engagement
// @route   POST /api/institution-engagements
// @access  Admin or Charity Admin
const createInstitutionEngagement = asyncHandler(async (req, res) => {
    try {
        const { volunteerName, description, eventName, assignedBy } = req.body;

        const newEngagement = new InstitutionEngagement({
            volunteerName,
            description,
            eventName,
            assignedBy,
            institution: req.user.institution,
            volunteerPic: req.file ? req.file.path : null,
        });

        const savedEngagement = await newEngagement.save();

        res.status(201).json({
            success: true,
            message: "Institution engagement created successfully!",
            data: savedEngagement,
        });
    } catch (error) {
        console.error("Error creating institution engagement:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

// @desc    Update an Institution Engagement
// @route   PUT /api/institution-engagements/:id
// @access  Admin or Charity Admin
const updateInstitutionEngagement = asyncHandler(async (req, res) => { 
    try {
        const { id } = req.params;
        const updates = req.body;
        if (req.file) {
          updates.volunteerPic = req.file.path; // Update image path if a new file is uploaded
        }

        updates.institution = req.user.institution;

        const engagement = await InstitutionEngagement.findById(id);
        if (!engagement) {
            return res.status(404).json({
                success: false,
                message: "Institution engagement not found",
            });
        }

        const updatedEngagement = await InstitutionEngagement.findByIdAndUpdate(id, updates, { new: true });

        res.status(200).json({
            success: true,
            message: "Institution engagement updated successfully!",
            data: updatedEngagement,
        });
    } catch (error) {
        console.error("Error updating institution engagement:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

// @desc    Delete an Institution Engagement
// @route   DELETE /api/institution-engagements/:id
// @access  Admin or Charity Admin
const deleteInstitutionEngagement = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const engagement = await InstitutionEngagement.findById(id);

        if (!engagement) {
            return res.status(404).json({
                success: false,
                message: "Institution engagement not found",
            });
        }

        await InstitutionEngagement.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Institution engagement deleted successfully!",
        });
    } catch (error) {
        console.error("Error deleting institution engagement:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

// @desc    Get Single Institution Engagement
// @route   GET /api/institution-engagements/:id
// @access  Admin or Charity Admin, Public
const getSingleInstitutionEngagement = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const engagement = await InstitutionEngagement.findById(id);

        if (!engagement) {
            return res.status(404).json({
                success: false,
                message: "Institution engagement not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Institution engagement fetched successfully!",
            data: engagement,
        });
    } catch (error) {
        console.error("Error fetching institution engagement:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

export {
    getAllInstitutions,
    getAllInstitutionEngagements,
    createInstitutionEngagement,
    updateInstitutionEngagement,
    deleteInstitutionEngagement,
    getSingleInstitutionEngagement,
};
