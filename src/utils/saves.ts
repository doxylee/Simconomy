import { IDBPDatabase, openDB } from "idb";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { useCore } from "@src/utils/useCore";

const SAVES_DB_NAME = "simconomy";
const SAVES_DB_VERSION = 1;
const SAVES_STORE_NAME = "saves";

export type SaveType = {
    id: string;
    name: string;
    savedAt: DateTime;
};

type SaveRecordType = {
    id: string;
    name: string;
    savedAt: string;
};

function saveToRecord({ id, name, savedAt }: SaveType): SaveRecordType {
    return { id, name, savedAt: savedAt.toISO() };
}

function recordToSave({ id, name, savedAt }: SaveRecordType): SaveType {
    return { id, name, savedAt: DateTime.fromISO(savedAt) };
}

function useSaveDB() {
    const [db, setDB] = useState<IDBPDatabase | null>(null);
    useEffect(() => {
        openDB(SAVES_DB_NAME, SAVES_DB_VERSION, {
            upgrade(db) {
                db.createObjectStore(SAVES_STORE_NAME);
            },
        }).then((db) => setDB(db));
    }, []);
    return db;
}

export function useGetSaves() {
    const db = useSaveDB();
    const [saves, setSaves] = useState<SaveType[] | undefined>(undefined);

    useEffect(() => {
        fetchSaves();
    }, [db]);

    function fetchSaves() {
        if (!db) return;
        db.getAll(SAVES_STORE_NAME).then((values) => setSaves(values.map(recordToSave)));
    }

    return { saves, fetchSaves };
}

export function useSaveGame() {
    const db = useSaveDB();
    const core = useCore();

    async function save() {
        if (!core) throw new Error("Tried to save without core.");
        if (!db) throw new Error("Tried to save without DB.");

        await core.save();
        const save: SaveType = {
            id: core.gameId,
            name: "Save",
            savedAt: DateTime.now(),
        };
        await db.put(SAVES_STORE_NAME, saveToRecord(save), save.id);
    }

    return save;
}
