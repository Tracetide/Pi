#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{thread, time::Duration};
use tauri::Manager;
use sysfs_gpio::{Direction, Pin};

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();
            thread::spawn(move || {
                let pin = Pin::new(17); // 使用GPIO17作为示例，具体使用的GPIO引脚请根据实际情况修改
                pin.with_exported(|| {
                    pin.set_direction(Direction::In)?;
                    loop {
                        let value = pin.get_value()?;
                        if value == 1 {
                            handle.emit_all("gpio-button-pressed", {}).unwrap();
                            // 避免重复触发事件，添加延时
                            thread::sleep(Duration::from_millis(500));
                        }
                        thread::sleep(Duration::from_millis(100)); // 每100毫秒检查一次GPIO状态
                    }
                }).unwrap();
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![start_call, end_call])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// 开始对讲的Rust逻辑
#[tauri::command]
fn start_call() -> Result<(), String> {
    // 添加对讲开始逻辑
    println!("开始对讲");
    Ok(())
}

// 结束对讲的Rust逻辑
#[tauri::command]
fn end_call() -> Result<(), String> {
    // 添加对讲结束逻辑
    println!("结束对讲");
    Ok(())
}
