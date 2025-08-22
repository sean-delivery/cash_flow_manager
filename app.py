import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

st.set_page_config(page_title="Cash Flow", layout="wide")
st.title("📊 Cash Flow Manager – Demo")

# נתונים דמו
dates = pd.date_range("2025-01-01", periods=30, freq="D")
income = np.random.randint(500, 3000, size=len(dates))
expense = np.random.randint(300, 2500, size=len(dates))
df = pd.DataFrame({"date": dates, "income": income, "expense": expense})
df["net"] = df["income"] - df["expense"]

st.subheader("טבלה")
st.dataframe(df)

st.subheader("גרף תזרים")
fig, ax = plt.subplots()
ax.plot(df["date"], df["income"], label="Income")
ax.plot(df["date"], df["expense"], label="Expense")
ax.plot(df["date"], df["net"], label="Net")
ax.legend()
st.pyplot(fig)
