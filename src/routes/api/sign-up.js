import { createSession, getUserByEmail, registerUser } from './_db';
import { serialize } from 'cookie';
import bcrypt from 'bcrypt';

export async function post({ body: { email, password } }) {
    const user = await getUserByEmail(email);

    if (user) {
        return {
            status: 409,
            body: {
                message: 'User already exists'
            }
        };
    }

    const saltRounds = 10;
    await registerUser({
        email,
        password: await bcrypt.hash(password, saltRounds)
    });

    const { id } = await createSession(email);
    return {
        status: 201,
        Headers: {
            'Set-Cookie': serialize('session_id', id, {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7 // one week
            })
        },
        body: {
            message: 'Sucessfully signed up'
        }
    };
}