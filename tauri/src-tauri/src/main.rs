#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{thread, time::Duration};
use sysfs_gpio::{Direction, Pin};
use tauri::Manager;

#[tauri::command]
fn start_call() {
    println!("开始对讲");
    // 在这里实现开始对讲的逻辑
}

#[tauri::command]
fn end_call() {
    println!("结束对讲");
    // 在这里实现结束对讲的逻辑
}

fn main() {
    let button_pin = Pin::new(17); // 假设按钮连接到GPIO 17

    // 创建一个新的线程来监听按钮事件
    thread::spawn(move || {
        button_pin.with_exported(|| {
            button_pin.set_direction(Direction::In)?;
            loop {
                match button_pin.get_value() {
                    Ok(value) => {
                        if value == 1 {
                            println!("按钮按下，开始对讲");
                            // 这里调用 `start_call`
                            start_call();
                            // 等待按钮释放
                            while button_pin.get_value().unwrap_or(0) == 1 {}
                            println!("按钮释放，结束对讲");
                            // 这里调用 `end_call`
                            end_call();
                        }
                    }
                    Err(e) => println!("读取引脚值时出错: {}", e),
                }
                thread::sleep(Duration::from_millis(100));
            }
        }).unwrap();
    });

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![start_call, end_call])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
