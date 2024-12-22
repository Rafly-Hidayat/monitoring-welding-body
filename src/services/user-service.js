import prisma from "../database.js"
import { ResponseError } from "../err/err-response.js"
import { createUserValidation, updateUserValidation, loginUserValidation } from "../validation/user-schema.js"
import { validation } from "../validation/validation.js"

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const login = async (request) => {
    const data = validation(loginUserValidation, request)

    const user = await prisma.user.findFirst({
        where: { username: data.username },
        include: {
            role: {
                include: { permissions: true }
            }
        }
    })

    if (!user) {
        throw new ResponseError(401, "Username or password is incorrect!")
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password)

    if (!passwordMatch) {
        throw new ResponseError(401, "Username or password is incorrect!")
    }

    const token = jwt.sign(
        {
            userId: user.ulid,
            username: user.username,
            email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    )

    return {
        token,
        user: {
            ulid: user.ulid,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role.code,
            permissions: user.role.permissions.map((item) => item.code) ?? null
        }
    }
}

const createUser = async (request) => {
    const data = validation(createUserValidation, request)

    const user = await prisma.user.findFirst({
        where: { username: data.username }
    })

    if (user) {
        throw new ResponseError(409, "Username already in use")
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(data.password, saltRounds)
    data.password = passwordHash

    const role = await prisma.role.findFirst({
        where: { code: data.role }
    })

    delete data.role
    data.roleId = role.id
    return prisma.user.create({
        data, include: {
            role: true
        }
    })
}

const getAllUsers = async () => {
    const users = await prisma.user.findMany({
        include: {
            role: {
                include: { permissions: true }
            }
        }
    })

    return users.map(user => {
        return {
            ulid: user.ulid,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role.code,
            role_description: user.role.description,
            permissions: user.role.permissions.map((item) => item.code) ?? null
        }
    })
}

const getUserById = async (ulid) => {
    const user = await prisma.user.findUnique({
        where: { ulid },
        include: {
            role: {
                include: { permissions: true }
            }
        }
    })

    if (!user) {
        throw new ResponseError(404, "User not found")
    }

    return {
        ulid: user.ulid,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role.code,
        role_description: user.role.description,
        permissions: user.role.permissions.map((item) => item.code) ?? null
    }
}

const updateUser = async (request) => {
    const data = validation(updateUserValidation, request)

    const user = await prisma.user.findUnique({
        where: { ulid: data.id }
    })

    if (!user) {
        throw new ResponseError(404, "User not found")
    }

    if (data.password) {
        const saltRounds = 10
        const passwordHash = await bcrypt.hash(data.password, saltRounds)
        data.password = passwordHash
    }

    delete data.id

    return prisma.user.update({
        where: { id: user.id },
        data
    })
}

const deleteUser = async (id) => {
    const user = await prisma.user.findUnique({
        where: { ulid: id }
    })

    if (!user) {
        throw new ResponseError(404, "User not found")
    }

    return prisma.user.delete({
        where: { id: user.id }
    })
}

export default { login, createUser, getAllUsers, getUserById, updateUser, deleteUser }
