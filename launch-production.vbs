' Athena AI Production Launcher (No Console Window)
' This script launches Athena AI in production mode without showing console windows

Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the directory where this script is located
strScriptDir = objFSO.GetParentFolderName(WScript.ScriptFullName)

' Change to the application directory
objShell.CurrentDirectory = strScriptDir

' Check if node_modules exists
If Not objFSO.FolderExists(strScriptDir & "\node_modules") Then
    MsgBox "Application dependencies not found." & vbCrLf & vbCrLf & _
           "Please ensure the application is properly installed." & vbCrLf & _
           "If this is a development build, run 'npm install' first.", _
           vbCritical, "Athena AI - Launch Error"
    WScript.Quit
End If

' Check if production build exists
If Not objFSO.FileExists(strScriptDir & "\dist\index.js") Then
    MsgBox "Production build not found." & vbCrLf & vbCrLf & _
           "Please run 'npm run build' in the application folder first.", _
           vbCritical, "Athena AI - Build Required"
    WScript.Quit
End If

' Launch Electron in production mode (hidden window)
' The 0 parameter hides the console window
objShell.Run "cmd /c set NODE_ENV=production && npx electron electron-main.cjs", 0, False

' Optional: Show a brief notification that the app is launching
' Using Popup instead of MsgBox for the timeout feature
objShell.Popup "Athena AI is starting..." & vbCrLf & _
               "The application will open momentarily.", _
               2, "Athena AI", vbInformation