// A simple Node.js fetch is needed. If your Netlify environment supports it by default, great.
// Otherwise, you might need to add `node-fetch` to a package.json.
// For this example, let's assume a modern Node environment where fetch is available.

exports.handler = async (event, context) => {
    // گرفتن شماره صفحه از درخواست کاربر
    const page = event.queryStringParameters.page || '0';
    
    const API_URL = "https://shop.mci.ir/api/Products/SimCard";
    const PARAMS = {
        "page": parseInt(page),
        "size": 20, // می‌توانید برای سرعت بیشتر این عدد را افزایش دهید، مثلا 50
        "productTypeId": 3,
        "orderBy": "DEFAULT",
        "number": null, "salePrice": null, "simCardTypeId": null,
        "simCardWorkGroupId": null, "provinceId": null, "cityId": null,
        "isService": false,
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(PARAMS),
        });

        if (!response.ok) {
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: 'Failed to fetch data from MCI server.' }),
            };
        }

        const data = await response.json();
        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
