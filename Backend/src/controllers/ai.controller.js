const { getCodeReview } = require("../services/ai.service"); 

module.exports.getReview = async (req, res) => {
    
    console.log("AI Controller received request body keys:", Object.keys(req.body));
    
    const code = req.body.code;   
    
    
    if (!code || typeof code !== 'string' || code.trim() === '') {
        
        return res.status(400).json({ message: "Code property is required in the request body." });
    }  
    
    try {
        const reviewText = await getCodeReview(code);
        
        res.status(200).send(reviewText);
    } catch (error) {
       
        console.error("Error generating code review from Gemini API:", error.message);
        
        
        res.status(500).json({ 
            message: "Internal Server Error: Failed to process review.",
            details: "Please check the backend console for the full error details (likely an API key issue)."
        });
    }
};
