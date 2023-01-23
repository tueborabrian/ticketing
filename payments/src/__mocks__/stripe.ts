export const stripe = {
    charges: {
        create: jest.fn().mockResolvedValue({
            id: 'ch_3MT9bFJyJzrEnJbe004YoX3M'
        })
    }
};