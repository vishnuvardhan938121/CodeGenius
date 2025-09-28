const { getCodeReview } = require("../services/ai.service"); // Import the named function correctly

module.exports.getReview = async (req, res) => {
    // Debugging line (optional, but helpful):
    // This logs the keys in the request body to confirm the JSON middleware is working.
    console.log("AI Controller received request body keys:", Object.keys(req.body));
    
    const code = req.body.code;   
    
    // Input validation: Check if the 'code' property is present and not empty.
    if (!code || typeof code !== 'string' || code.trim() === '') {
        // Send a 400 error if input is missing or empty
        return res.status(400).json({ message: "Code property is required in the request body." });
    }  
    
    try {
        const reviewText = await getCodeReview(code);
        // Successful response
        res.status(200).send(reviewText);
    } catch (error) {
        // CATCH: This is crucial for handling API key errors or service failures.
        console.error("Error generating code review from Gemini API:", error.message);
        
        // Return a generic 500 error to the client
        res.status(500).json({ 
            message: "Internal Server Error: Failed to process review.",
            details: "Please check the backend console for the full error details (likely an API key issue)."
        });
    }
};
