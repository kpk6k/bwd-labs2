import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import * as eventApi from '../../api/eventService';
import type { Event } from '../../types/event';

export type DateFilter = 'all' | 'today' | 'week' | 'month';

interface EventsState {
  events: Event[];
  myEvents: Event[];
  loading: boolean;
  error: string | null;
  filter: DateFilter;
}

const initialState: EventsState = {
  events: [],
  myEvents: [],
  loading: false,
  error: null,
  filter: 'all',
};

export const fetchEvents = createAsyncThunk(
  'events/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await eventApi.getEvents();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || error.message);
      }
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch events'
      );
    }
  }
);

export const fetchMyEvents = createAsyncThunk(
  'events/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      return await eventApi.getMyEvents();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || error.message);
      }
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch your events'
      );
    }
  }
);
//нужно добавть restoreEvent()
export const createEvent = createAsyncThunk(
  'events/create',
  async (
    eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>,
    { rejectWithValue }
  ) => {
    try {
      return await eventApi.createEvent(eventData);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || error.message);
      }
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to create event'
      );
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/update',
  async (
    {
      id,
      data,
    }: {
      id: number;
      data: Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt'>>;
    },
    { rejectWithValue }
  ) => {
    try {
      return await eventApi.updateEvent(id, data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || error.message);
      }
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to update event'
      );
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await eventApi.deleteEvent(id);
      return id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || error.message);
      }
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to delete event'
      );
    }
  }
);

export const restoreEvent = createAsyncThunk(
  'events/restore',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await eventApi.restoreEvent(id);
      return { id, ...response };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || error.message);
      }
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to restore event'
      );
    }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<DateFilter>) => {
      state.filter = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMyEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.myEvents = action.payload;
      })
      .addCase(fetchMyEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.events.push(action.payload);
        state.myEvents.push(action.payload);
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        const updateInList = (list: Event[]) => {
          const index = list.findIndex((e) => e.id === action.payload.id);
          if (index !== -1) list[index] = action.payload;
        };
        updateInList(state.events);
        updateInList(state.myEvents);
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.events = state.events.filter((e) => e.id !== action.payload);
        state.myEvents = state.myEvents.filter((e) => e.id !== action.payload);
      })
	  .addCase(restoreEvent.pending, (state) => {
      state.loading = true;
      state.error = null;
      })
      .addCase(restoreEvent.fulfilled, (state, action) => {
      state.loading = false;
      const restoredEvent = action.payload;
      
      const eventIndex = state.events.findIndex(e => e.id === restoredEvent.id);
      if (eventIndex !== -1) {
        state.events[eventIndex] = {
          ...state.events[eventIndex],
          deletedAt: null,
        };
      }
      
      const myEventIndex = state.myEvents.findIndex(e => e.id === restoredEvent.id);
      if (myEventIndex !== -1) {
        state.myEvents[myEventIndex] = {
          ...state.myEvents[myEventIndex],
          deletedAt: null,
        };
      }
    })
    .addCase(restoreEvent.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setFilter, clearError } = eventsSlice.actions;
export default eventsSlice.reducer;
