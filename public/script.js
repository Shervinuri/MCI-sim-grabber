document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const loader = document.getElementById('loader');
    const statusDiv = document.getElementById('status');
    const downloadLinksDiv = document.getElementById('download-links');

    let allData = [];

    // تابع اصلی برای جمع‌آوری اطلاعات
    async function startScraping() {
        allData = [];
        let page = 0;
        let hasMorePages = true;

        while(hasMorePages) {
            statusDiv.innerText = `در حال دریافت اطلاعات صفحه ${page + 1}...`;
            
            try {
                // به پراکسی فانکشن خودمان درخواست می‌زنیم
                const response = await fetch(`/api/proxy?page=${page}`);
                if (!response.ok) {
                    throw new Error(`خطا در دریافت صفحه ${page + 1}`);
                }
                const result = await response.json();
                const items = result.data?.items || [];

                if (items.length > 0) {
                    items.forEach(item => {
                        allData.push({
                            'شماره': item.number,
                            'قیمت (ریال)': item.salePrice
                        });
                    });
                    page++;
                } else {
                    hasMorePages = false; // به انتهای لیست رسیدیم
                }
            } catch (error) {
                statusDiv.innerText = `فرآیند با خطا متوقف شد: ${error.message}`;
                hasMorePages = false;
            }
        }
        
        if(allData.length > 0) {
            statusDiv.innerText = `عملیات با موفقیت تمام شد. ${allData.length} شماره پیدا شد.`;
            createDownloadLinks();
        } else {
            statusDiv.innerText = 'هیچ داده‌ای پیدا نشد یا خطایی رخ داد.';
        }
    }

    // تابع برای ساخت لینک‌های دانلود
    function createDownloadLinks() {
        downloadLinksDiv.innerHTML = '';
        const formats = ['CSV', 'JSON', 'TXT'];
        formats.forEach(format => {
            const link = document.createElement('a');
            link.innerText = `دانلود به صورت ${format}`;
            link.href = '#';
            link.onclick = (e) => {
                e.preventDefault();
                downloadFile(format);
            };
            downloadLinksDiv.appendChild(link);
        });
    }

    // تابع برای ساخت و دانلود فایل در مرورگر
    function downloadFile(format) {
        let dataStr, mimeType, filename;
        const bom = "\uFEFF"; // BOM for UTF-8 Excel compatibility

        switch(format.toLowerCase()) {
            case 'csv':
                const header = Object.keys(allData[0]).join(',');
                const rows = allData.map(row => Object.values(row).join(','));
                dataStr = bom + [header, ...rows].join('\n');
                mimeType = 'text/csv;charset=utf-8;';
                filename = 'mci_simcards.csv';
                break;
            case 'json':
                dataStr = JSON.stringify(allData, null, 4);
                mimeType = 'application/json';
                filename = 'mci_simcards.json';
                break;
            case 'txt':
                dataStr = allData.map(row => `شماره: ${row['شماره']}, قیمت: ${row['قیمت (ریال)']}`).join('\n');
                mimeType = 'text/plain';
                filename = 'mci_simcards.txt';
                break;
        }

        const blob = new Blob([dataStr], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    startButton.addEventListener('click', async () => {
        startButton.disabled = true;
        startButton.innerText = 'در حال جمع‌آوری...';
        loader.style.display = 'block';
        downloadLinksDiv.innerHTML = '';

        await startScraping(); // منتظر می‌مانیم تا فرآیند تمام شود

        loader.style.display = 'none';
        startButton.disabled = false;
        startButton.innerText = '🚀 شروع مجدد';
    });
});
