// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_shell::ShellExt;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Start the Python Sidecar
            let sidecar_command = app.shell().sidecar("api-backend").unwrap();
            let (mut _rx, mut _child) = sidecar_command
                .spawn()
                .expect("Failed to spawn sidecar");

            println!("Python Sidecar started successfully.");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}