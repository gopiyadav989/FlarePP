// controllers/userController.js
import Creator from "../models/creatorModel.js";
// import Editor from "../models/editorModel.js";

export const assignedEditors = async (req, res) => {
    console.log("assigning");
    
    try {
        const creatorId = req.user.id;

        const creator = await Creator.findById(creatorId)
            .populate("preferredEditors", "name username avatar email role");

        

        if (!creator) {
            return res.status(404).json({ message: "Creator not found" });
        }

        console.log(creator.preferredEditors);
        
        res.status(200).json({ users: creator.preferredEditors });
    } catch (error) {
        console.error("Error in assignedEditors:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
};
