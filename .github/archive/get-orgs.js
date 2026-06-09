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

async function main() {
    const orgs = await getOrgs();

    console.log(JSON.stringify(orgs, null, 2));
}
await main();
