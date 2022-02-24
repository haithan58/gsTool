/*
Author: Lê Văn Đông - www.levandong.com
Refer: https://www.labnol.org/code/19979-copy-folders-drive
*/
function main() {
  let src = "Folder src";
  let des = "Folder des";

  try {
    src = src.match(/(?<=folders\/).*?((?=\?)|$)/g)[0].toString();
    des = des.match(/(?<=folders\/).*?((?=\?)|$)/g)[0].toString();
  }
  catch (e) {
    Logger.log("Check source or destination folder ID again. Err: " + e);
  }
  start(src, des);
}

function start(sourceFolderID, targetFolder) {

  var source = DriveApp.getFolderById(sourceFolderID);
  var name = source.getName();
  var target = null;

  if (targetFolder == "") {
    console.log("Create folder" + name);
    targetFolder = "Copy of " + name;
    target = DriveApp.createFolder(targetFolder);
  }
  else {
    console.log("Go to target folder");
    target = DriveApp.getFolderById(targetFolder);
  }

  copyFolder(source, target);
}

function getAllNameOfFilesInFolder(folder) {
  let arr = [];
  let files = folder.getFiles();

  while (files.hasNext()) {
    let file = files.next();
    arr.push(file.getName());
  }
  arr.sort();
  return arr;

}

function getAllNameOfSubfolderInFolder(folder) {
  let arr = [];
  let folders = folder.getFolders();

  while (folders.hasNext()) {
    let folder = folders.next();
    arr.push(folder.getName());
  }
  arr.sort();
  return arr;

}

function createQuerry(arr) {
  var querry = "";
  for (var i = 0; i < arr.length - 1;i++) {
    querry += 'title = \"' + arr[i] + "\" or";
  }
  return querry + "title = \"" + arr[arr.length - 1] + "\"";
}

function copyFolder(source, target) {
//Folder copy incomplete
  //Change the symbol at target folder (Folder don't already copy)
  var ispecialFolders = target.searchFolders('title contains \"chuacopyxong\"');
  while (ispecialFolders.hasNext()) {
    var folder = ispecialFolders.next();
    var name = folder.getName().split("chuacopyxong ")[1];

    //Find same folder in source
    var ifolderInSource = source.getFoldersByName(name); // itor
    while (ifolderInSource.hasNext()) { // has a
      Logger.log("Go to: " + name);
      copyFolder(ifolderInSource.next(), folder); // copy
    }
    folder.setName(name); // Done in folder. Set name again.
  }

//Copy normal
  Logger.log("Scan source Folder");
  var srcSubfolders = getAllNameOfSubfolderInFolder(source);
  var srcFiles = getAllNameOfFilesInFolder(source);
  Logger.log("Scan des Folder");
  var desSubfolders = getAllNameOfSubfolderInFolder(target);
  var desFiles = getAllNameOfFilesInFolder(target);

  var diffFolders = srcSubfolders.filter(x => !desSubfolders.includes(x));
  var diffFiles = srcFiles.filter(x => !desFiles.includes(x));

  //Make querry
  var querryFolder = createQuerry(diffFolders);
  var querryFile = createQuerry(diffFiles);

  //Search and Copy
  if (querryFile != "") {
    var files = source.searchFiles(querryFile);

    //Copy files
    while (files.hasNext()) {
      var file = files.next();
      var name = file.getName();
      console.log("Make copy file: " + name);
      file.makeCopy(name, target);
    }
  }
  if (querryFolder != "") {
    var folders = source.searchFolders(querryFolder);
    //Copy Folder
    while (folders.hasNext()) {
      var folder = folders.next();
      var name = folder.getName();
      Logger.log("Create folder: " + name);
      var targetSub = target.createFolder("chuacopyxong " + name);
      copyFolder(folder, targetSub);
      targetSub.setName(name);
    }
  }
}