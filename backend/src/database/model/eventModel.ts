import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db.js';
import User from './userModel.js';

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

interface EventAttributes {
    id: number;
    title: string;
    description: string | null;
    date: Date;
    createdBy: number;
    createdAt?: Date;
    deletedAt?: Date | null;
}

type EventCreationAttributes = Optional<EventAttributes, 'id' | 'deletedAt'>;

class eventModel
    extends Model<EventAttributes, EventCreationAttributes>
    implements EventAttributes
{
    public id!: number;
    public title!: string;
    public description!: string | null;
    public date!: Date;
    public createdBy!: number;
    public createdAt!: Date;
    public deletedAt!: Date | null;
}

eventModel.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            unique: true,
            autoIncrement: true,
            allowNull: false,
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
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: User,
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            field: 'deleted_at',
        },
    },
    {
        sequelize,
        modelName: 'events',
        paranoid: true,
        timestamps: true,
        deletedAt: 'deletedAt',
    },
);

User.hasMany(eventModel, { foreignKey: 'createdBy' });
eventModel.belongsTo(User, { foreignKey: 'createdBy' });

sequelize
    .sync({ alter: true })
    .then(() => {
        console.log("Table 'events' created successfully!");
    })
    .catch((err: Error) => {
        console.error("Unable to create table 'events': ", err);
    });

export default eventModel;
