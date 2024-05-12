const express = require("express");
const agencyModel = require("./model");
const multer = require('multer');
const router = express.Router();
const upload = multer();
const agencyService = require("../Agency/service");
const { asyncHandler } = require("../../utility/common");
const roleMiddleware = require('../../middlewares/roleMiddleware');
const authMiddleware = require('../../middlewares/authMiddleware');
const {
  AGENCY_OWNER,
  ADMIN,
}=require('../../config/constants');


const registerAgencyHandler = asyncHandler(async (req, res) => {
  try {
    const userId = req.params._id; // Assuming userId is available in the request

    // Call the service function to handle agency registration
    const result = await agencyService.registerAgencyService(userId, req.body, req.files);

    // Send response based on the result
    res.status(result.status).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
const getAllPendingHostHandler = asyncHandler(async (req, res) => {
  const userRole = req.body.role;
  const pendingResult = await agencyService.getPendingHostService(userRole);
  if (!pendingResult) {
    return res.status(401).json({ message: "Failed to show pending result" }); // Unauthorized access
  }
  res.status(200).json(pendingResult); // Return the approval result
});

const approveHostHandler = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const role = req.body.role;

  try {
    const host = await agencyService.approveHostService(userId, role);
    if (host) {
      res.status(200).json({ message: 'Host approved successfully', host });
    }
    res.status(404).json({ message: 'Host not found' });
   
  } catch (error) {
    console.error('Error approving host:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



router.post("/registerAgency/:_id", upload.fields([{ name: 'nidPhotoFront', maxCount: 1 }, { name: 'nidPhotoBack', maxCount: 1 }]), registerAgencyHandler);
router.get("/getAllPendingHostHandler",authMiddleware,
roleMiddleware([AGENCY_OWNER, ADMIN]),getAllPendingHostHandler);
router.post("/approveHostHandler/:userId",approveHostHandler)//authMiddleware,roleMiddleware([AGENCY_OWNER, ADMIN])
module.exports = router;
