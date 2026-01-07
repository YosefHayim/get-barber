import { act } from '@testing-library/react-native';

type StoreCreator<T> = () => T;

export const createStoreResetter = <T extends { getState: () => object }>(
  useStore: T
) => {
  let initialState: object;

  const captureInitialState = () => {
    initialState = { ...useStore.getState() };
  };

  const resetStore = () => {
    const currentState = useStore.getState() as Record<string, unknown>;
    for (const key of Object.keys(currentState)) {
      if (typeof currentState[key] === 'function') continue;
      (currentState as Record<string, unknown>)[key] = (initialState as Record<string, unknown>)[key];
    }
  };

  return { captureInitialState, resetStore };
};

export const resetZustandStore = (useStore: { setState: (state: object) => void }, initialState: object) => {
  act(() => {
    useStore.setState(initialState);
  });
};

export const getStoreActions = <T extends Record<string, unknown>>(state: T): string[] => {
  return Object.keys(state).filter((key) => typeof state[key] === 'function');
};

export const getStoreData = <T extends Record<string, unknown>>(state: T): Partial<T> => {
  const data: Partial<T> = {};
  for (const key of Object.keys(state)) {
    if (typeof state[key] !== 'function') {
      data[key as keyof T] = state[key] as T[keyof T];
    }
  }
  return data;
};

export const waitForStoreUpdate = async (ms: number = 0): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      act(() => {
        resolve();
      });
    }, ms);
  });
};
