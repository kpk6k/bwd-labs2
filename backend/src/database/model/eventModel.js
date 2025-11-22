import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import userModel from "./userModel.js"

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the event
 *           example: 1
 *         title:
 *           type: string
 *           description: Title of the event
 *           example: "Annual Company Meeting"
 *         description:
 *           type: string
 *           description: Description of the event
 *           example: "A meeting to discuss company strategies for the upcoming year."
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date and time of the event
 *           example: "2023-11-30T10:00:00Z"
 *         createdBy:
 *           type: integer
 *           description: ID of the user who created the event
 *           example: 2
 *       required:
 *         - title
 *         - date
 */

// Define 'events' model
const eventModel = sequelize.define('events', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: userModel,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
});

userModel.hasMany(eventModel, { foreignKey: 'createdBy' });
eventModel.belongsTo(userModel, { foreignKey: 'createdBy' });

sequelize.sync().then(() => {
   console.log("Table 'events' created successfully!");
}).catch((err) => {
   console.error("Unable to create table 'events': ", err);
});

export default eventModel;
