export const handler = async () => {
    const shitMyself = new Date('February 7, 24 13:50:20 GMT+00:00')
    return {
        statusCode: 200,
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(shitMyself),
    };
};