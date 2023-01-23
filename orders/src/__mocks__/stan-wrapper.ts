export const stanWrapper = {
    client: {
        publish: jest.fn().mockImplementation((subject: string, data: string, callback: () => void) => {
            callback();
        })
    }
};