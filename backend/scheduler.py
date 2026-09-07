from apscheduler.schedulers.background import BackgroundScheduler
from database import SessionLocal
from crud import delete_expired_notes


scheduler = BackgroundScheduler()


def cleanup_expired_notes():
    db = SessionLocal()

    try:
        deleted_count = delete_expired_notes(db)
        print(
            f"[Scheduler] Automatically deleted "
            f"{deleted_count} expired trash notes."
        )
    except Exception as e:
        print(f"[Scheduler] Cleanup failed: {e}")
    finally:
        db.close()


def start_scheduler():
    cleanup_expired_notes()

    scheduler.add_job(
        cleanup_expired_notes,
        "interval",
        hours=24,
        id="trash_cleanup",
        replace_existing=True
    )

    scheduler.start()

    print("[Scheduler] Trash cleanup scheduler started.")