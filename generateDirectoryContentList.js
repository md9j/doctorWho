// Import the 'fs' and 'path' modules to work with the file system and file paths
import fs from 'fs';
import path from 'path';

// Define the path to the workspace directory
const workspacePath = path.dirname(new URL(import.meta.url).pathname);

// List of directories and files to ignore
const ignoredDirectories = [`.git`, `node_modules`, `.vscode`, `.idea`, `dist`, `build`, `coverage`, `.github`, `.circleci`];
const ignoredFiles = ['.env', '.DS_Store'];

// Function to recursively read directories and files
function readDirectoryContents(directoryPath) {
  const contents = fs.readdirSync(directoryPath);
  const filesAndDirs = [];

  for (const content of contents) {
    const contentPath = path.join(directoryPath, content);
    const stats = fs.statSync(contentPath);

    if (stats.isDirectory() && !ignoredDirectories.includes(content)) {
      // If it's a directory, recursively read its contents
      const subContents = readDirectoryContents(contentPath);
      filesAndDirs.push({ type: 'directory', name: content, contents: subContents });
    } else if (stats.isFile() && !ignoredFiles.includes(content)) {
      // If it's a file, include it
      filesAndDirs.push({ type: 'file', name: content });
    }
  }

  return filesAndDirs;
}

// Recursively read the workspace directory
const allContents = readDirectoryContents(workspacePath);

// Function to create a numbered list of projects in Markdown format
function createMarkdownList(contents, depth = 0) {
  return contents
    .map((content, index) => {
      const indent = '  '.repeat(depth); // Adjust the indentation based on depth
      if (content.type === 'directory') {
        const subList = createMarkdownList(content.contents, depth + 1);
        return `${indent}- **[${content.name}]**\n${subList}`;
      } else {
        return `${indent}- \`${content.name}\``;
      }
    })
    .join('\n');
}

// Create a numbered list of all contents in Markdown format
const numberedContentsList = createMarkdownList(allContents);

// Path to the README.md file and read its content
const readmePath = path.join(workspacePath, 'README.md');
let readmeContent = fs.readFileSync(readmePath, 'utf8');

// Define the start and end markers for the projects list within the README.md file
const markerStart = '<!-- START: contents list -->';
const markerEnd = '<!-- END: contents list -->';

// Replace the projects list within the README.md file with the updated Markdown list
const updatedReadmeContent = readmeContent.replace(
  new RegExp(`${markerStart}[\\s\\S]*${markerEnd}`),
  `${markerStart}\n${numberedContentsList}\n${markerEnd}`
);

// Write the updated README.md file
fs.writeFileSync(readmePath, updatedReadmeContent, 'utf8');