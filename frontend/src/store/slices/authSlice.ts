import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';
import axios from 'axios';
import {
    login as apiLogin,
    register as apiRegister,
    type RegisterData,
} from '../../api/authService';
import {getUsers} from '../../api/userService';
import {
    setAccessToken,
    removeAccessToken,
    setUser,
    removeUser,
} from '../../utils/storage';
import type {User} from '../../types/user';
import {decodeToken} from '../../utils/token';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: (() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    })(),
    isLoading: false,
    error: null,
};

export const login = createAsyncThunk(
    'auth/login',
    async (
        {email, password}: {email: string; password: string},
        {rejectWithValue}
    ) => {
        try {
            const loginResponse = await apiLogin({email, password});
			console.log('Login response:', loginResponse);
            const token = loginResponse.token;
            setAccessToken(token);

            const payload = decodeToken(token);
			console.log('Decoded payload:', payload);
            if (!payload) throw new Error('Invalid token');

            const users = await getUsers();
            const currentUser = {
                id: payload.id,
                email: payload.email,
                name: payload.name || email.split('@')[0]
            };
            if (!currentUser) throw new Error('User not found');

            setUser(currentUser);
            return {user: currentUser};
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(
                    error.response?.data?.message || error.message
                );
            }
            return rejectWithValue(
                error instanceof Error ? error.message : 'Login failed'
            );
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (userData: RegisterData, {rejectWithValue}) => {
        try {
            await apiRegister(userData);
            return; // success, no payload needed
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(
                    error.response?.data?.message || error.message
                );
            }
            return rejectWithValue(
                error instanceof Error ? error.message : 'Registration failed'
            );
        }
    }
);

export const logout = createAsyncThunk('auth/logout', async () => {
    removeAccessToken();
    removeUser();
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        updateUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            setUser(action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(register.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
            });
    },
});

export const {clearError, updateUser} = authSlice.actions;
export default authSlice.reducer;
