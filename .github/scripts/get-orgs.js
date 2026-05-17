import fs from 'fs';
async function getOrgs() {
    const url = 'https://summerofcode.withgoogle.com/api/program/2026/organizations/';
    try {
        const response = await fetch(url);
        if(!response) {
            throw new Error('Failed to fetch organizations');
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching organizations:', error);
    }
}

const filename = '2026.json';
const path = './data/'+filename;
fs.writeFile(
    path,
    JSON.stringify(await getOrgs(), null, 2),
    function (err) {
        if (err) {
            return console.error(err);
        }
    }
);
