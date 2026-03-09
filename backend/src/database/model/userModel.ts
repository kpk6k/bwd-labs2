import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db.js';
import bcrypt from 'bcryptjs';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the user
 *           example: 1
 *         name:
 *           type: string
 *           description: Full name of the user
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the user
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           description: Password (hashed) of the user
 *           example: "$2b$10$somethinghashed"
 *         failed_attempts:
 *           type: integer
 *           description: Number of failed login attempts
 *           example: 3
 *         isLocked:
 *           type: boolean
 *           description: Indicates if the account is locked due to failed attempts
 *           example: false
 *         lockUntil:
 *           type: string
 *           format: date-time
 *           description: Timestamp until the account is locked
 *           example: "2023-11-30T10:00:00Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the user was created
 *           example: "2023-11-22T14:30:00Z"
 *       required:
 *         - name
 *         - email
 *         - password
 */

export interface UserAttributes {
    id: number;
    name: string;
    email: string;
    password: string;
    failed_attempts: number;
    isLocked: boolean;
    lockUntil: Date | null;
    createdAt?: Date;
}

type UserCreationAttributes = Optional<
    UserAttributes,
    'id' | 'failed_attempts' | 'isLocked' | 'lockUntil'
>;

class User
    extends Model<UserAttributes, UserCreationAttributes>
    implements UserAttributes
{
    public id!: number;
    public name!: string;
    public email!: string;
    public password!: string;
    public failed_attempts!: number;
    public isLocked!: boolean;
    public lockUntil!: Date | null;
    public createdAt!: Date;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            unique: true,
            autoIncrement: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: { isEmail: true },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        failed_attempts: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        isLocked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        lockUntil: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        createdAt: DataTypes.DATE,
    },
    {
        sequelize,
        modelName: 'users',
        timestamps: true,
    },
);

User.beforeCreate(async (user) => {
    user.password = await bcrypt.hash(user.password, 10);
});

sequelize
    .sync()
    .then(() => {
        console.log("Table 'users' created successfully!");
    })
    .catch((err: Error) => {
        console.error("Unable to create table 'users': ", err);
    });

export default User;
