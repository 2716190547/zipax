//! Background execution helpers for CPU-heavy compression work.

use std::sync::{Mutex, OnceLock};

static COMPRESSION_LOCK: OnceLock<Mutex<()>> = OnceLock::new();

pub fn run_serialized<T>(work: impl FnOnce() -> T) -> T {
    let lock = COMPRESSION_LOCK.get_or_init(|| Mutex::new(()));
    let _guard = lock.lock().unwrap_or_else(|poisoned| poisoned.into_inner());
    work()
}
