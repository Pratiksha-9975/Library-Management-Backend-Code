import cron from "node-cron";
import { Borrow } from "../models/borrowModel.js";
import {User} from "../models/userModel.js"
import { sendEmail } from "../utils/sendEmail.js";

export const notifyUsers = () => {
  cron.schedule("*/30 * * * * ", async () => { 

    try {
        const oneDayAgo = new Date(Date.now()- 24 * 60 * 60 * 1000);
        const borrowers = await Borrow.find({
            dueDate:{
                $lt:oneDayAgo 
            },
            returnDate:null,
            nofified:false,
        })
        for(const element of borrowers){
            if(element.user && element.user.email){
                const user = await User.findById(element.user.id)
            }
            sendEmail({
                email,
                subject:"Book Return Reminder",
                message:``
            })
            element.notified = true;
            await element.save();
        }
    } catch (error) {
        console.error("some error while notifying User")
    }
  });
};


