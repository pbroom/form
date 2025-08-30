import {create} from 'zustand';

type DevtoolsState = {
	enabled: boolean;
	toggle: () => void;
	set: (value: boolean) => void;
};

export const useDevtoolsStore = create<DevtoolsState>((set) => ({
	enabled: false,
	toggle: () => set((s) => ({enabled: !s.enabled})),
	set: (value: boolean) => set({enabled: value}),
}));
