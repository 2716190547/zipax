//! Platform-specific child process configuration.

use std::{ffi::OsStr, process::Command};

pub(crate) fn background_command(program: impl AsRef<OsStr>) -> Command {
    let command = Command::new(program);

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;

        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        let mut command = command;
        command.creation_flags(CREATE_NO_WINDOW);
        command
    }

    #[cfg(not(target_os = "windows"))]
    command
}
