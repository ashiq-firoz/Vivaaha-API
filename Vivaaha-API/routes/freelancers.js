const express = require("express");
const Freelancer = require("../models/Freelancer");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');
const User = require("../models/User");

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = 'uploads/freelance';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `freelance-${uniqueSuffix}${ext}`);
  }
});

// File filter to only accept image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

// Configure the multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // limit to 5MB
  },
  fileFilter: fileFilter
});

// Helper function to delete old images
const deleteOldImage = async (filePath) => {
  if (!filePath) return;
  
  try {
    // Remove URL prefix if exists to get the actual file path
    const localPath = filePath.replace(/^(http|https):\/\/[^\/]+\//, '');
    
    if (fs.existsSync(localPath) && !localPath.includes('default-image')) {
      fs.unlinkSync(localPath);
    }
  } catch (error) {
    console.error('Error deleting old image:', error);
  }
};


// POST route to get freelancers by category
router.post('/by-category', async (req, res) => {
  try {
    const { category } = req.body;
    
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    const freelancers = await Freelancer.find({ category });

    // For each freelancer, fetch address fields from User and combine
    const freelancersWithAddress = await Promise.all(
      freelancers.map(async (freelancer) => {
        let address = "";
        try {
          const user = await User.findById(freelancer.userId);
          if (user) {
            const {
              addressline1 = "",
              adressline2 = "",
              city = "",
              state = "",
              country = "",
              pin = ""
            } = user;
            // Combine address fields, filter out empty, join with comma
            address = [
              addressline1,
              adressline2,
              city,
              state,
              country,
              pin
            ].filter(Boolean).join(', ');
          }
        } catch (err) {
          // If user not found or error, leave address as empty string
        }
        // Return freelancer object with address field
        return {
          ...freelancer.toObject(),
          address
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: freelancersWithAddress
    });
    
  } catch (error) {
    console.error('Error fetching freelancers by category:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch freelancers',
      error: error.message
    });
  }
});

// POST route to get all freelancer emails and total user count
router.post('/emails-and-usercount', async (req, res) => {
  try {
    // Get all freelancer emails
    const freelancers = await Freelancer.find({}, 'companymailid');
    const emails = freelancers.map(f => f.companymailid);

    // Get total user count
    const totalUsers = await User.countDocuments();

    return res.status(200).json({
      success: true,
      emails,
      totalUsers
    });
  } catch (error) {
    console.error('Error fetching emails and user count:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch emails and user count',
      error: error.message
    });
  }
});

// POST route to get business data for authenticated user
router.post('/business/get-data', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    // Find the business record for the authenticated user
    const businessData = await Freelancer.findOne({ userId });

    if (!businessData) {
      return res.status(404).json({
        success: false,
        message: 'No business data found for this user'
      });
    }
    //console.log(businessData)
    return res.status(200).json({
      success: true,
      data: businessData
    });

  } catch (error) {
    console.error('Error fetching business data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch business data',
      error: error.message
    });
  }
});

// POST route to add or edit a freelance record with images
router.post(
  '/business', 
  authMiddleware,
  upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 4 }
  ]), 
  async (req, res) => {
    try {
      // console.log('Received files:', req.files);
      // console.log('Received body:', req.body);

      const userId = req.user._id;
      const { 
        companyname,
        companymailid,
        registrationno,
        category,
        location,
        bio,
        pricing,
        ifscCode,
        panNumber,
        bankAccountNumber
      } = req.body;

      // Initialize the freelance data with matching field names
      let freelanceData = {
        userId,
        companyname: companyname || "",
        companymailid: companymailid || "",
        registrationno: registrationno || "",
        category: category || "Venues",
        location: location || "",
        bio: bio || "",
        pricing: pricing ? Number(pricing) : 0,
        pan:panNumber,
        account_no:bankAccountNumber,
        ifsc:ifscCode,
        linkaccount : "",
      };

      // Handle file uploads
      if (req.files) {
        if (req.files.mainImage && req.files.mainImage[0]) {
          freelanceData.image1 = req.files.mainImage[0].path;
        }

        if (req.files.galleryImages) {
          const galleryFiles = req.files.galleryImages;
          for (let i = 0; i < Math.min(galleryFiles.length, 4); i++) {
            freelanceData[`image${i+2}`] = galleryFiles[i].path;
          }
        }
      }

      
    // const payload = {
    //   name:companyname,
    //   email:companymailid,
    //   tnc_accepted: true,
    //   account_details: {
    //     business_name:companyname,
    //     business_type:'individual'
    //   },
    //   bank_account: {
    //     ifsc_code:ifscCode,
    //     beneficiary_name:companyname,
    //     account_type:'current',
    //     account_number:bankAccountNumber
    //   }
    // };
    
    // const RAZORPAY_API_URL = 'https://api.razorpay.com/v1/beta/accounts';
    // const RAZORPAY_KEY_ID = process.env.RAZOPAY_KEY
    // const RAZORPAY_KEY_SECRET = process.env.RAZOPAY_SECRET

    // const response = await fetch(RAZORPAY_API_URL, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')
    //   },
    //   body: JSON.stringify(payload)
    // });

    // const data = await response.json();

    // if (response.ok) {
    //   console.log('✅ Account created:', data.id);
    //   //res.status(200).json({ account_id: data.id });
    // } else {
    //   console.error('❌ Razorpay API error:', data);
    //   res.status(response.status).json({ error: data });
    // }
    
    // freelanceData.linkaccount = data.id;
      // Find existing record by userId
      const existingRecord = await Freelancer.findOne({ userId });
      let result;
      
      if (existingRecord) {
        const oldImages = {
          image1: existingRecord.image1,
          image2: existingRecord.image2,
          image3: existingRecord.image3,
          image4: existingRecord.image4,
          image5: existingRecord.image5
        };
        
        // Update existing record with all fields
        result = await Freelancer.findOneAndUpdate(
          { userId },
          { $set: freelanceData }, // Use $set to ensure all fields are updated
          { new: true, runValidators: true }
        );
        
        // Delete old images if replaced
        for (let i = 1; i <= 5; i++) {
          const imgField = `image${i}`;
          if (freelanceData[imgField] && oldImages[imgField] && freelanceData[imgField] !== oldImages[imgField]) {
            await deleteOldImage(oldImages[imgField]);
          }
        }
      } else {
        // Create new record
        const newFreelancer = new Freelancer(freelanceData);
        result = await newFreelancer.save();
      }

      return res.status(200).json({
        success: true,
        message: 'Freelancer record processed successfully',
        data: result
      });

    } catch (error) {
      console.error('Error processing request:', error);
      if (req.files) {
        Object.values(req.files).flat().forEach(file => {
          fs.unlink(file.path, err => {
            if (err) console.error('Error deleting file:', err);
          });
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to process freelancer record',
        error: error.message
      });
    }
  }
);

// POST route to delete a freelance record
router.post('/freelance/delete', async (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ success: false, message: 'Freelance ID is required' });
    }
    
    // Get the record first to access the image paths
    const freelanceToDelete = await Freelance.findById(id);
    
    if (!freelanceToDelete) {
      return res.status(404).json({ success: false, message: 'Freelance record not found' });
    }
    
    // Delete the record
    const deletedFreelance = await Freelance.findByIdAndDelete(id);
    
    // Delete associated image files
    for (let i = 1; i <= 5; i++) {
      const imgField = `image${i}`;
      if (freelanceToDelete[imgField]) {
        await deleteOldImage(freelanceToDelete[imgField]);
      }
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Freelance record deleted successfully',
      data: deletedFreelance
    });
  } catch (error) {
    console.error('Error in freelance delete:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to delete freelance record', 
      error: error.message 
    });
  }
});

// POST route to create/update a business
router.post('/business', 
  authMiddleware, // Add authentication middleware
  upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 4 }
  ]),
  async (req, res) => {
    try {
      const {
        id,  // For updates
        companyname,
        companymailid,
        registrationno,
        category,
        location,
        bio,
        pricing
      } = req.body;

      console.log(req.body)
      console.log(req.user)
      // Get userId from authenticated user
      const userId = req.user._id;
      

      // Validate required fields
      if (!companyname || !companymailid) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: companyname and companymailid are mandatory'
        });
      }

      // Prepare business data
      const businessData = {
        userId,
        companyname,
        companymailid,
        registrationno: registrationno || '',
        category: category || 'Venues',
        location: location || '',
        bio: bio || '',
        pricing: pricing ? Number(pricing) : 0
      };

      // Rest of the code remains the same...
      if (req.files) {
        if (req.files.mainImage && req.files.mainImage[0]) {
          businessData.image1 = req.files.mainImage[0].path;
        }

        if (req.files.galleryImages) {
          const galleryFiles = req.files.galleryImages;
          for (let i = 0; i < Math.min(galleryFiles.length, 4); i++) {
            businessData[`image${i+2}`] = galleryFiles[i].path;
          }
        }
      }

      let result;
      let oldImages = {};

      if (id) {
        const existingBusiness = await Freelancer.findById(id);
        if (!existingBusiness) {
          return res.status(404).json({
            success: false,
            message: 'Business not found'
          });
        }

        // Add ownership check
        if (existingBusiness.userId.toString() !== userId.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Unauthorized: You can only update your own business'
          });
        }

        oldImages = {
          image1: existingBusiness.image1,
          image2: existingBusiness.image2,
          image3: existingBusiness.image3,
          image4: existingBusiness.image4,
          image5: existingBusiness.image5
        };

        result = await Freelancer.findByIdAndUpdate(
          id,
          businessData,
          { new: true, runValidators: true }
        );

        for (let i = 1; i <= 5; i++) {
          const imgField = `image${i}`;
          if (businessData[imgField] && oldImages[imgField] && businessData[imgField] !== oldImages[imgField]) {
            await deleteOldImage(oldImages[imgField]);
          }
        }

      } else {
        const newBusiness = new Freelancer(businessData);
        result = await newBusiness.save();
      }

      return res.status(id ? 200 : 201).json({
        success: true,
        message: `Business ${id ? 'updated' : 'created'} successfully`,
        data: result
      });

    } catch (error) {
      if (req.files) {
        Object.values(req.files).flat().forEach(file => {
          fs.unlink(file.path, err => {
            if (err) console.error('Error deleting file after request error:', err);
          });
        });
      }

      console.error('Error in business create/update:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to process business',
        error: error.message
      });
    }
  }
);

// POST route to delete a business
router.post('/business/delete', async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Business ID is required'
      });
    }

    const deletedBusiness = await Freelancer.findByIdAndDelete(id);

    if (!deletedBusiness) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Business deleted successfully',
      data: deletedBusiness
    });
  } catch (error) {
    console.error('Error in business delete:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete business',
      error: error.message
    });
  }
});

// Get all freelancers
router.get("/", async (req, res) => {
  try {
    const freelancers = await Freelancer.find();
    res.json(freelancers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a freelancer by ID
router.get("/:id", async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id);
    res.json(freelancer);
  } catch (err) {
    res.status(404).json({ error: "Freelancer not found" });
  }
});

module.exports = router;
