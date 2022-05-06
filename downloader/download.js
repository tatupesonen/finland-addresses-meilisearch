import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import SevenZip from "node-7z";
const dir = './archive';
import { MeiliSearch } from "meilisearch";
import glob from "glob-promise";
import csv from "csvtojson";

console.log("Starting importer...");
const filename = (s) => s.replace(/[^a-z0-9]/gi, '_').toLowerCase();

const downloadFile = async (url, path) => {
	const res = await fetch(url);
	const fileStream = fs.createWriteStream(path);
	console.log(`Downloading ${url} to ${path}...`);
	await new Promise((resolve, reject) => {
		res.body.pipe(fileStream);
		res.body.on("error", reject);
		fileStream.on("finish", resolve);
	});
};


// Make the directory if it does not exist yet.
if (!fs.existsSync(dir)) {
	fs.mkdirSync(dir);
}

// Get the metadata
const metadataUrl = 'http://avoindata.fi/data/api/3/action/package_show?id=postcodes'
const { result: metadata } = await fetch(metadataUrl).then(response => response.json())
const resourceMetadatas = metadata.resources;
const resource = resourceMetadatas.sort((a, b) => new Date(a.qa?.updated) - new Date(b.qa?.updated))[0];

await downloadFile(resource.url, path.join(dir, filename(resource.name)))

console.log(`Extracting ${path.join(dir, filename(resource.name))}`);
console.log(path.join(dir, filename(resource.name)), dir + "/" + filename(resource.name + "archive"));
SevenZip.extractFull(path.join(dir, filename(resource.name)), dir + "/" + filename(resource.name + "archive"))

const files = await glob(`${dir}/**/[0-9][0-9]*.csv`);

// Create meili client
const meili = new MeiliSearch({
	host: 'http://meilisearch:7700',
	apiKey: process.env.MEILI_MASTER_KEY,
})

// For each file create a job that batches it to Meilisearch.
files.forEach(async (file) => {
	console.log(`Parsing ${file}...`);
	const parsed = await csv().fromFile(file);
	await meili.index("fi-addresses").addDocuments(parsed);
	console.log(`Sent ${file} to Meilisearch.`);
})

