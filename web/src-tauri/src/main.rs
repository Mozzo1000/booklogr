// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent; // Added for logging

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // 1. Prepare the sidecar command
            let sidecar_command = app.shell().sidecar("api-backend").unwrap();

            // 2. Spawn the sidecar
            let (mut rx, mut _child) = sidecar_command
                .spawn()
                .expect("Failed to spawn sidecar");

            // 3. Log output from Python to the terminal (very helpful for debugging!)
            tauri::async_runtime::spawn(async move {
                while let Some(event) = rx.recv().await {
                    match event {
                        CommandEvent::Stdout(line) => {
                            println!("Python STDOUT: {}", String::from_utf8_lossy(&line));
                        }
                        CommandEvent::Stderr(line) => {
                            eprintln!("Python STDERR: {}", String::from_utf8_lossy(&line));
                        }
                        _ => {}
                    }
                }
            });

            println!("Sidecar process initiated.");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}