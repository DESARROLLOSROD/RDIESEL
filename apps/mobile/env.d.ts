declare namespace NodeJS {
    interface ProcessEnv {
        EXPO_PUBLIC_API_URL: string;
        [key: string]: string | undefined;
    }
}

declare var process: {
    env: NodeJS.ProcessEnv;
};
