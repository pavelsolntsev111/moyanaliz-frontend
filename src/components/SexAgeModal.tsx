"use client";

import { useState } from "react";

interface Props {
  fileName: string;
  onSubmit: (sex: string, age: number) => void;
  onCancel: () => void;
}

export default function SexAgeModal({ fileName, onSubmit, onCancel }: Props) {
  const [sex, setSex] = useState<string>("");
  const [age, setAge] = useState<string>("");

  const isValid = sex !== "" && age !== "" && Number(age) >= 0 && Number(age) <= 120;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-1">Данные для расшифровки</h2>
        <p className="text-sm text-muted mb-5">
          Файл: <span className="font-medium text-foreground">{fileName}</span>
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Пол</label>
          <div className="flex gap-3">
            {[
              { value: "male", label: "Мужской" },
              { value: "female", label: "Женский" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSex(opt.value)}
                className={`flex-1 py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition ${
                  sex === opt.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/30"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" htmlFor="age">
            Возраст
          </label>
          <input
            id="age"
            type="number"
            min={0}
            max={120}
            placeholder="Введите возраст"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full rounded-xl border-2 border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl border-2 border-border text-sm font-medium hover:bg-card transition"
          >
            Отмена
          </button>
          <button
            type="button"
            disabled={!isValid}
            onClick={() => isValid && onSubmit(sex, Number(age))}
            className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Расшифровать
          </button>
        </div>
      </div>
    </div>
  );
}
