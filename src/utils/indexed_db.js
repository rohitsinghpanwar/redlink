let db;
export const openDB=()=>{
    return new Promise((resolve,reject)=>{
        const request =indexedDB.open("RemindersDB",1);
        request.onupgradeneeded=(event)=>{
            db=event.target.result;
            if(!db.objectStoreNames.contains('reminders')){
                db.createObjectStore("reminders",{keyPath:"id",autoIncrement:true})
            }
        }

        request.onsuccess=(event)=>{
            db=event.target.result;
            resolve(db);
        }
        request.onerror=(event)=>{
            reject("IndexedDB error" + event.target.error)
        }
    })
}

export const addReminder=async (time,text)=>{
    const db =await openDB();
    const transaction = db.transaction(["reminders"],"readwrite");
    const store=transaction.objectStore("reminders");
    store.add({time:new Date(time).getTime(),text})
}
export const deleteReminder = async (id) => {
    const db = await openDB();
    const transaction = db.transaction(["reminders"], "readwrite");
    const store = transaction.objectStore("reminders");

    store.delete(id);

    transaction.oncomplete = () => {
        console.log(`Reminder with ID ${id} deleted`);
    };

    transaction.onerror = (event) => {
        console.error("Failed to delete reminder:", event.target.error);
    };
};


export const checkReminders = async () => {
    const db = await openDB();
    const transaction = db.transaction(["reminders"], "readonly");
    const store = transaction.objectStore("reminders");

    const request = store.getAll();

    request.onsuccess = () => {
        const reminders = request.result; // ✅ Extract actual data

        if (!Array.isArray(reminders)) {
            console.error("Data retrieved is not an array:", reminders);
            return;
        }

        const now = new Date().getTime();

        reminders.forEach((reminder) => {
            if (now >= reminder.time) {
                navigator.serviceWorker.ready.then((registration) => {
                    registration.showNotification("Reminder", {
                        body: reminder.text,
                        icon: "/icon.png",
                        badge: "/badge.png"
                    });
                });
                deleteReminder(reminder.id);
            }
        });
    };

    request.onerror = (event) => {
        console.error("Error fetching reminders:", event.target.error);
    };
};
setInterval(checkReminders, 60000);
