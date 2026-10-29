#!/usr/bin/env python3
"""
Full Complete RPG Maker MV + NUSV Game Database Studio Generator.
100% English UI + rich Indonesian hover tooltips (title="...") on every label, button, and header.
Includes visual image previews for Face Graphic, Character Sprite, SV Battler, and Enemy Battlers.
Includes interactive real-time visual EXP Curve Graph with sliders and presets.
Includes Dual Level Simulator (Base Level & Class Level) with Nusvanir Tier Caps.
"""

import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
OUTPUT_FILE = ROOT_DIR / "editor.html"

HTML_CONTENT = r'''<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NUSV Full Database Studio</title>
    <style>
        :root {
            --bg-color: #0b0f19;
            --sidebar-bg: #111827;
            --card-bg: #1e293b;
            --card-header: #0f172a;
            --border-color: #334155;
            --accent: #3b82f6;
            --accent-hover: #2563eb;
            --accent-glow: rgba(59, 130, 246, 0.3);
            --gold: #f59e0b;
            --green: #10b981;
            --red: #ef4444;
            --purple: #8b5cf6;
            --cyan: #06b6d4;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --input-bg: #0f172a;
            --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: var(--font-family);
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-main);
            height: 100vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        /* Top Navbar */
        header {
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid var(--border-color);
            padding: 10px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 10;
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .brand h1 {
            font-size: 1.15rem;
            font-weight: 700;
            letter-spacing: -0.5px;
            background: linear-gradient(135deg, #60a5fa, #a855f7);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .brand span {
            font-size: 0.75rem;
            background: #1e293b;
            padding: 2px 8px;
            border-radius: 9999px;
            border: 1px solid var(--border-color);
            color: var(--text-muted);
        }

        .unsaved-badge {
            display: none;
            font-size: 0.75rem;
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid var(--red);
            color: #fca5a5;
            padding: 2px 8px;
            border-radius: 9999px;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .nav-tabs {
            display: flex;
            gap: 4px;
            overflow-x: auto;
            max-width: 65%;
            padding: 2px 0;
        }

        .tab-btn {
            background: transparent;
            border: 1px solid transparent;
            color: var(--text-muted);
            padding: 6px 10px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.8rem;
            font-weight: 600;
            white-space: nowrap;
            transition: all 0.2s ease;
        }

        .tab-btn:hover {
            color: var(--text-main);
            background: rgba(255, 255, 255, 0.05);
        }

        .tab-btn.active {
            color: #fff;
            background: var(--card-bg);
            border-color: var(--border-color);
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .btn {
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 0.82rem;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .btn-primary {
            background: var(--accent);
            color: white;
            box-shadow: 0 0 15px var(--accent-glow);
        }

        .btn-primary:hover {
            background: var(--accent-hover);
        }

        .btn-secondary {
            background: #1e293b;
            color: var(--text-main);
            border: 1px solid var(--border-color);
        }

        .btn-secondary:hover {
            background: #334155;
        }

        .btn-danger {
            background: rgba(239, 68, 68, 0.2);
            color: #fca5a5;
            border: 1px solid var(--red);
        }

        .btn-danger:hover {
            background: var(--red);
            color: white;
        }

        .btn-sm {
            padding: 3px 8px;
            font-size: 0.75rem;
        }

        /* Layout Grid */
        main {
            display: flex;
            flex: 1;
            overflow: hidden;
        }

        /* Left Sidebar (Item List) */
        .sidebar {
            width: 290px;
            background: var(--sidebar-bg);
            border-right: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            flex-shrink: 0;
        }

        .search-box {
            padding: 10px 12px;
            border-bottom: 1px solid var(--border-color);
            background: rgba(0,0,0,0.1);
        }

        .search-input {
            width: 100%;
            background: var(--input-bg);
            border: 1px solid var(--border-color);
            color: var(--text-main);
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 0.85rem;
            outline: none;
        }

        .search-input:focus {
            border-color: var(--accent);
        }

        .filter-pills {
            display: flex;
            gap: 6px;
            overflow-x: auto;
            padding: 8px 12px;
            border-bottom: 1px solid var(--border-color);
            background: rgba(0, 0, 0, 0.2);
        }

        .filter-pill {
            background: transparent;
            border: 1px solid var(--border-color);
            color: var(--text-muted);
            padding: 3px 10px;
            border-radius: 9999px;
            font-size: 0.75rem;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.15s ease;
        }

        .filter-pill:hover {
            color: var(--text-main);
            background: rgba(255, 255, 255, 0.05);
        }

        .filter-pill.active {
            color: white;
            background: var(--accent);
            border-color: var(--accent);
            font-weight: 600;
        }

        .item-list {
            flex: 1;
            overflow-y: auto;
            padding: 6px;
        }

        .list-item {
            padding: 8px 10px;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: background 0.15s ease;
            font-size: 0.85rem;
            margin-bottom: 2px;
        }

        .list-item:hover {
            background: rgba(255, 255, 255, 0.05);
        }

        .list-item.active {
            background: var(--card-bg);
            border-left: 3px solid var(--accent);
            font-weight: 600;
        }

        .list-id {
            color: var(--text-muted);
            font-size: 0.75rem;
            font-family: monospace;
            width: 32px;
            flex-shrink: 0;
        }

        .list-name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex: 1;
        }

        .list-badge {
            font-size: 0.7rem;
            padding: 1px 6px;
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.08);
            color: var(--text-muted);
            flex-shrink: 0;
        }

        /* Workspace Content (Middle Column: Form Edit) */
        .workspace {
            flex: 1;
            overflow-y: auto;
            padding: 20px 24px;
            background: radial-gradient(circle at top right, rgba(30, 41, 59, 0.5), transparent 70%);
            min-width: 460px;
        }

        .panel-container {
            max-width: 860px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 18px;
            padding-bottom: 60px;
        }

        /* Right Sidebar (Kolom Hasil Stat Akhir & Live Simulation) */
        .stat-sidebar {
            width: 440px;
            background: var(--sidebar-bg);
            border-left: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            flex-shrink: 0;
            box-shadow: -4px 0 16px rgba(0, 0, 0, 0.25);
            z-index: 10;
        }

        .stat-sidebar-header {
            padding: 12px 18px;
            border-bottom: 1px solid var(--border-color);
            background: var(--card-header);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
        }

        .stat-sidebar-header h3 {
            font-size: 0.95rem;
            font-weight: 700;
            color: #f8fafc;
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0;
        }

        .stat-sidebar-content {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 16px 16px 60px 16px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .stat-sidebar-content > * {
            flex-shrink: 0;
        }

        .stat-sidebar-content::-webkit-scrollbar {
            width: 6px;
        }
        .stat-sidebar-content::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
        }
        .stat-sidebar-content::-webkit-scrollbar-thumb {
            background: var(--border-color);
            border-radius: 4px;
        }
        .stat-sidebar-content::-webkit-scrollbar-thumb:hover {
            background: var(--accent);
        }

        @media (max-width: 1400px) {
            .stat-sidebar {
                width: 410px;
            }
        }

        /* Cards */
        .card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        }

        .card-header {
            background: var(--card-header);
            border-bottom: 1px solid var(--border-color);
            padding: 12px 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .card-header h2 {
            font-size: 1.05rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .card-body {
            padding: 16px 18px;
        }

        /* Form elements */
        .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }

        .grid-3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 14px;
        }

        .grid-4 {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
        }

        .stat-grid-6 {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
            gap: 10px;
            margin-top: 8px;
        }

        .stat-grid-8 {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(115px, 1fr));
            gap: 10px;
            margin-top: 8px;
        }

        .stat-card-input {
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .stat-card-input label {
            font-size: 0.8rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .form-group {
            margin-bottom: 14px;
        }

        .form-group:last-child {
            margin-bottom: 0;
        }

        .form-group label {
            display: block;
            font-size: 0.82rem;
            font-weight: 600;
            margin-bottom: 5px;
            color: #cbd5e1;
        }

        .form-control {
            width: 100%;
            background: var(--input-bg);
            border: 1px solid var(--border-color);
            color: var(--text-main);
            padding: 8px 10px;
            border-radius: 6px;
            font-size: 0.85rem;
            outline: none;
            transition: border-color 0.15s ease;
        }

        .form-control:focus {
            border-color: var(--accent);
        }

        textarea.form-control {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            line-height: 1.45;
            resize: vertical;
        }

        .helper-text {
            font-size: 0.75rem;
            color: var(--text-muted);
            margin-top: 4px;
        }

        .checkbox-label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.85rem;
            cursor: pointer;
            user-select: none;
        }

        .checkbox-label input[type="checkbox"] {
            width: 16px;
            height: 16px;
            cursor: pointer;
        }

        /* Portrait & Preview Box */
        .portrait-preview-box {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #0b1120;
            border: 1px dashed var(--border-color);
            border-radius: 8px;
            height: 220px;
            overflow: hidden;
            position: relative;
        }

        .portrait-img {
            max-height: 100%;
            max-width: 100%;
            object-fit: contain;
        }

        .portrait-empty {
            color: var(--text-muted);
            font-size: 0.8rem;
            text-align: center;
            padding: 12px;
        }

        /* Equip Slot Grid */
        .equip-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 10px;
        }

        .equip-slot-item {
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 10px;
        }

        .slot-title {
            font-size: 0.78rem;
            font-weight: 700;
            color: #93c5fd;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        /* Tables & Sliders */
        .stat-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.85rem;
            margin-top: 8px;
        }

        .stat-table th, .stat-table td {
            padding: 8px 10px;
            border-bottom: 1px solid var(--border-color);
            text-align: left;
        }

        .stat-table th {
            background: rgba(15, 23, 42, 0.9);
            color: var(--text-muted);
            font-weight: 600;
        }

        .stat-table tr:hover {
            background: rgba(255, 255, 255, 0.02);
        }

        .slider-box {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 14px;
        }

        /* Toast */
        .toast {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: #1e293b;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            border-left: 4px solid var(--accent);
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 100;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .toast.show {
            transform: translateY(0);
            opacity: 1;
        }

        .toast.success { border-left-color: var(--green); }
        .toast.error { border-left-color: var(--red); }
    
        /* Interactive Tooltip & Help Styling */
        [title] {
            /* Default cursor retained */
        }
        label[title] {
            border-bottom: 1px dotted rgba(148, 163, 184, 0.4);
            padding-bottom: 1px;
            display: inline-block;
            transition: color 0.15s, border-color 0.15s;
        }
        label[title]:hover {
            color: #60a5fa !important;
            border-bottom-color: #60a5fa !important;
        }
        .stat-card-input[title] {
            transition: border-color 0.15s, transform 0.15s;
        }
        .stat-card-input[title]:hover {
            border-color: #3b82f6 !important;
            transform: translateY(-1px);
        }

        /* Floating Bottom Hover Info Bar */
        .hover-info-bar {
            position: fixed;
            bottom: 16px;
            left: 50%;
            transform: translateX(-50%) translateY(50px);
            background: rgba(15, 23, 42, 0.96);
            border: 1px solid var(--accent);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(8px);
            padding: 9px 24px;
            border-radius: 9999px;
            font-size: 0.82rem;
            color: #e2e8f0;
            pointer-events: none;
            opacity: 0;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 9999;
            max-width: 85%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .hover-info-bar.visible {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    
    
        /* Graphic Sprite & Sheet Visual Preview */
        .graphic-preview-card {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            transition: border-color 0.15s;
        }
        .graphic-preview-card:hover {
            border-color: rgba(59, 130, 246, 0.4);
        }
        .badge-sub {
            font-size: 0.72rem;
            color: var(--accent);
            background: rgba(59, 130, 246, 0.15);
            padding: 2px 8px;
            border-radius: 4px;
            border: 1px solid rgba(59, 130, 246, 0.3);
        }
        .sprite-preview-box {
            width: 100%;
            height: 120px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            background-color: #0f172a;
            background-image: 
                linear-gradient(45deg, rgba(255, 255, 255, 0.04) 25%, transparent 25%), 
                linear-gradient(-45deg, rgba(255, 255, 255, 0.04) 25%, transparent 25%), 
                linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.04) 75%), 
                linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.04) 75%);
            background-size: 16px 16px;
            background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            position: relative;
            box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4);
            margin-bottom: 10px;
            cursor: pointer;
            transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .sprite-preview-box:hover {
            border-color: var(--accent);
            transform: translateY(-2px);
            box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
        }
        .empty-preview {
            font-size: 0.75rem;
            color: var(--text-muted);
            text-align: center;
            padding: 10px;
        }
        .pixel-sprite {
            image-rendering: pixelated;
            background-repeat: no-repeat;
        }
        .face-frame {
            width: 96px;
            height: 96px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
        }
        .char-frame {
            width: 64px;
            height: 64px;
            transform: scale(1.3);
        }
        .sv-frame {
            width: 72px;
            height: 72px;
            transform: scale(1.3);
        }
        .index-grid-8 {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 4px;
            margin-top: 4px;
        }
        .idx-btn {
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid var(--border-color);
            color: var(--text-muted);
            font-size: 0.75rem;
            font-weight: 700;
            padding: 4px 0;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.15s;
        }
        .idx-btn:hover:not(:disabled) {
            background: rgba(59, 130, 246, 0.25);
            color: #fff;
            border-color: var(--accent);
        }
        .idx-btn.active {
            background: var(--accent);
            color: #fff;
            border-color: var(--accent);
            box-shadow: 0 0 8px var(--accent-glow);
        }
        .idx-btn:disabled {
            opacity: 0.35;
            cursor: not-allowed;
        }

        /* Visual Sheet Selector Modal */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.15s ease-out;
        }
        .modal-card {
            background: #111827;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.9);
            max-width: 95vw;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .modal-header {
            background: #1e293b;
            padding: 12px 18px;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .modal-header h3 {
            margin: 0;
            font-size: 1rem;
            color: #fff;
        }
        .modal-body {
            padding: 20px;
            overflow: auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .sheet-canvas-container {
            position: relative;
            border: 2px solid var(--border-color);
            border-radius: 8px;
            overflow: hidden;
            background-color: #0b0f19;
            background-image: 
                linear-gradient(45deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%), 
                linear-gradient(-45deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%), 
                linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.05) 75%), 
                linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.05) 75%);
            background-size: 16px 16px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
        }
        .sheet-click-cell {
            position: absolute;
            border: 2px dashed rgba(255, 255, 255, 0.3);
            cursor: pointer;
            transition: all 0.15s;
            display: flex;
            align-items: flex-start;
            justify-content: flex-start;
            padding: 6px;
        }
        .sheet-click-cell:hover {
            border-color: #3b82f6;
            background: rgba(59, 130, 246, 0.35);
        }
        .sheet-click-cell.selected {
            border: 3px solid #3b82f6;
            background: rgba(59, 130, 246, 0.5);
            box-shadow: 0 0 16px rgba(59, 130, 246, 0.8);
        }
        .sheet-cell-badge {
            background: rgba(0, 0, 0, 0.75);
            color: #fff;
            font-size: 0.75rem;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            border: 1px solid rgba(255,255,255,0.2);
        }
    
    
        /* EXP Curve Canvas & Graph Styling */
        .exp-canvas-wrapper {
            position: relative;
            width: 100%;
            height: 230px;
            background: #0b0f19;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            overflow: hidden;
            box-shadow: inset 0 2px 8px rgba(0,0,0,0.5);
        }
    
    </style>
</head>
<body>

    <!-- Header Navbar -->
    <header>
        <div class="brand">
            <h1>NUSV Full Database Studio</h1>
            <span>v3.0 All-In-One</span>
            <div id="unsavedBadge" class="unsaved-badge" title="Perubahan belum disimpan ke file database project">Unsaved Changes</div>
        </div>

        <nav class="nav-tabs">
            <button class="tab-btn active" onclick="switchTab('actors')">🎭 Actors</button>
            <button class="tab-btn" onclick="switchTab('classes')">🛡️ Classes</button>
            <button class="tab-btn" onclick="switchTab('weapons')">⚔️ Weapons</button>
            <button class="tab-btn" onclick="switchTab('armors')">🛡️ Armors</button>
            <button class="tab-btn" onclick="switchTab('skills')">✨ Skills</button>
            <button class="tab-btn" onclick="switchTab('items')">🧪 Items</button>
            <button class="tab-btn" onclick="switchTab('enemies')">👾 Enemies</button>
            <button class="tab-btn" onclick="switchTab('states')">💫 States</button>
        </nav>

        <div class="header-actions">
            <button class="btn btn-secondary" onclick="reloadAllData()" title="Muat ulang seluruh data database dari file project">🔄 Reload Data</button>
            <button class="btn btn-primary" onclick="saveActiveDataset()" title="Simpan seluruh perubahan di tab aktif langsung ke file database project">💾 Save to Project</button>
        </div>
    </header>

    <!-- Main Content -->
    <main>
        <aside class="sidebar">
            <div class="search-box">
                <input type="text" id="searchInput" class="search-input" placeholder="Search by ID or name..." title="Ketik ID atau nama untuk memfilter daftar di sidebar" oninput="filterItems()">
            </div>
            <div id="sidebarFilters" class="filter-pills" style="display:none;"></div>
            <div class="item-list" id="sidebarList">
                <!-- Dynamically populated -->
            </div>
        </aside>

        <!-- 2. MIDDLE: Form Edit Panel -->
        <section class="workspace" id="workspace">
            <div class="panel-container" id="panelContainer">
                <!-- Dynamically populated editor panel -->
            </div>
        </section>

        <!-- 3. RIGHT: Hasil Stat Akhir & Live Simulation Column -->
        <aside class="stat-sidebar" id="statSidebar">
            <div class="stat-sidebar-header">
                <h3 id="statSidebarTitle">📊 Hasil Stat Akhir</h3>
                <span id="statSidebarSubtitle" style="font-size:0.75rem; color:var(--text-muted);">Live Simulation</span>
            </div>
            <div class="stat-sidebar-content" id="statPreviewContainer">
                <!-- Dynamically populated live stat preview -->
            </div>
        </aside>
    </main>

    <!-- Notification Toast -->
    <div id="toast" class="toast">
        <span id="toastIcon">💾</span>
        <span id="toastMessage">Disimpan</span>
    </div>

    <script>
        // State Store
        const State = {
            currentTab: 'actors',
            pictures: [],
            faces: [],
            characters: [],
            svActors: [],
            enemiesPics: [],
            actors: [],
            classes: [],
            weapons: [],
            armors: [],
            skills: [],
            items: [],
            enemies: [],
            states: [],
            animations: [],
            system: {},
            selectedIndex: 1,
            hasUnsavedChanges: false,
            classPreviewLevel: 1,
            actorSimBaseLevel: 1,
            actorSimClassLevel: 1,
            armorSlotFilter: 'all'
        };

        // Standard definitions
        const PARAM_DEFS = [
            { id: 0, code: 'MHP', name: 'Max HP', icon: '❤️', color: '#f87171' },
            { id: 1, code: 'MMP', name: 'Max MP', icon: '💧', color: '#60a5fa' },
            { id: 2, code: 'ATK', name: 'Attack (ATK)', icon: '⚔️', color: '#fb923c' },
            { id: 3, code: 'DEF', name: 'Defense (DEF)', icon: '🛡️', color: '#34d399' },
            { id: 4, code: 'MAT', name: 'M.Attack (MAT)', icon: '🔮', color: '#a78bfa' },
            { id: 5, code: 'MDF', name: 'M.Defense (MDF)', icon: '🔰', color: '#38bdf8' },
            { id: 6, code: 'AGI', name: 'Agility (AGI)', icon: '⚡', color: '#facc15' },
            { id: 7, code: 'LUK', name: 'Luck (LUK)', icon: '🍀', color: '#4ade80' }
        ];

        const CORE_ATTRIBUTES = [
            { code: 'STR', name: 'Strength', icon: '💪', color: '#ef4444' },
            { code: 'INT', name: 'Intelligence', icon: '🧠', color: '#3b82f6' },
            { code: 'DEX', name: 'Dexterity', icon: '🎯', color: '#f59e0b' },
            { code: 'AGI', name: 'Agility', icon: '⚡', color: '#10b981' },
            { code: 'VIT', name: 'Vitality', icon: '🛡️', color: '#06b6d4' },
            { code: 'LUK', name: 'Luck', icon: '🎲', color: '#a855f7' }
        ];

        const DERIVED_STAT_DEFS = [
            // Vitalitas & Regen
            { key: 'Max SP', name: 'Max SP (Stamina)', icon: '⚡', color: '#38bdf8', group: 'vital', placeholder: '+20' },
            { key: 'HRG Plus', name: 'HP Regen / Turn', icon: '❤️', color: '#f87171', group: 'vital', placeholder: '+3%' },
            { key: 'MRG Plus', name: 'MP Regen / Turn', icon: '💧', color: '#60a5fa', group: 'vital', placeholder: '+2%' },
            { key: 'TRG Plus', name: 'SP Regen / Turn', icon: '🔋', color: '#34d399', group: 'vital', placeholder: '+3%' },

            // Presisi & Kritis
            { key: 'HIT Plus', name: 'Hit Rate', desc: 'Bonus akurasi serangan fisik (<HIT Plus: +X%>)', icon: '🎯', color: '#facc15', group: 'offensive', placeholder: '+5%' },
            { key: 'CRI Plus', name: 'Critical Rate', icon: '💥', color: '#fb923c', group: 'offensive', placeholder: '+5%' },
            { key: 'Critical Damage', name: 'Critical Damage', icon: '🗡️', color: '#ef4444', group: 'offensive', placeholder: '+25%' },
            { key: 'Armor Penetration', name: 'Armor Penetration', desc: 'Mengabaikan persentase pertahanan fisik target (<Armor Penetration: +X%>)', icon: '🏹', color: '#f59e0b', group: 'offensive', placeholder: '15%' },
            { key: 'Magic Penetration', name: 'Magic Penetration', desc: 'Mengabaikan persentase pertahanan sihir target (<Magic Penetration: +X%>)', icon: '🔮', color: '#a78bfa', group: 'offensive', placeholder: '15%' },

            // Pertahanan & Mitigasi
            { key: 'PDR Plus', name: 'Physical Damage Reduction', desc: 'Pengurangan damage fisik yang diterima (<PDR Plus: +X%>)', icon: '🔰', color: '#34d399', group: 'defensive', placeholder: '-10%' },
            { key: 'MDR Plus', name: 'Magical Damage Reduction', desc: 'Pengurangan damage sihir yang diterima (<MDR Plus: +X%>)', icon: '💠', color: '#38bdf8', group: 'defensive', placeholder: '-10%' },
            { key: 'GRD Plus', name: 'Guard Mitigation', desc: 'Efisiensi pengurangan damage saat mode bertahan (<GRD Plus: +X%>)', icon: '🛡️', color: '#60a5fa', group: 'defensive', placeholder: '+20%' },
            { key: 'EVA Plus', name: 'Evasion Rate', desc: 'Peluang menghindari serangan fisik musuh (<EVA Plus: +X%>)', icon: '💨', color: '#10b981', group: 'defensive', placeholder: '+5%' },
            { key: 'CEV Plus', name: 'Critical Evasion', desc: 'Resistensi terhadap serangan kritikal musuh (<CEV Plus: +X%>)', icon: '🛡️', color: '#4ade80', group: 'defensive', placeholder: '+5%' },
            { key: 'MEV Plus', name: 'Magic Evasion', desc: 'Peluang menghindari serangan sihir musuh (<MEV Plus: +X%>)', icon: '🍃', color: '#a3e635', group: 'defensive', placeholder: '+5%' },
            { key: 'MRF Plus', name: 'Magic Reflection', desc: 'Peluang memantulkan serangan sihir (<MRF Plus: +X%>)', icon: '🪞', color: '#2dd4bf', group: 'defensive', placeholder: '+5%' },
            { key: 'CNT Plus', name: 'Counter Attack Rate', desc: 'Peluang membalas serangan fisik langsung (<CNT Plus: +X%>)', icon: '⚔️', color: '#f43f5e', group: 'defensive', placeholder: '+10%' },

            // Utilitas & Aggro
            { key: 'MCR Plus', name: 'MP Cost Rate', desc: 'Tingkat efisiensi konsumsi MP (minus = hemat) (<MCR Plus: -X%>)', icon: '🧪', color: '#818cf8', group: 'utility', placeholder: '-10%' },
            { key: 'TGR Plus', name: 'Target Rate / Aggro', desc: 'Tingkat kecenderungan musuh menarget karakter ini (<TGR Plus: +X%>)', icon: '👁️', color: '#c084fc', group: 'utility', placeholder: '+20%' }
        ];

        const SCOPE_NAMES = {
            0: 'None',
            1: '1 Enemy',
            2: 'All Enemies',
            3: '1 Random Enemy',
            4: '2 Random Enemies',
            5: '3 Random Enemies',
            6: '4 Random Enemies',
            7: '1 Ally',
            8: 'All Allies',
            9: '1 Dead Ally',
            10: 'All Dead Allies',
            11: 'Pengguna Sendiri (User)'
        };

        const OCCASION_NAMES = {
            0: 'Selalu (Battle & Menu)',
            1: 'Battle Only',
            2: 'Menu Only',
            3: 'Never'
        };

        const HIT_TYPES = {
            0: 'Certain Hit',
            1: 'Physical Attack',
            2: 'Magical Attack'
        };

        const DAMAGE_TYPES = {
            0: 'None',
            1: 'HP Damage',
            2: 'MP Damage',
            3: 'HP Recovery',
            4: 'MP Recovery',
            5: 'HP Drain',
            6: 'MP Drain'
        };

        function getIVGradeInfo(val) {
            const r = Math.max(1, Math.min(10, parseInt(val, 10) || 5));
            if (r >= 10) return { grade: 'S', color: '#ec4899', rate: 2.0, label: 'Grade S (+2.0/Lv) Max' };
            if (r >= 8) return { grade: 'A', color: '#a855f7', rate: 1.6 + (r - 8) * 0.2, label: `Grade A (+${(1.6 + (r - 8) * 0.2).toFixed(1)}/Lv) High` };
            if (r >= 6) return { grade: 'B', color: '#3b82f6', rate: 1.2 + (r - 6) * 0.2, label: `Grade B (+${(1.2 + (r - 6) * 0.2).toFixed(1)}/Lv) Balanced` };
            if (r >= 4) return { grade: 'C', color: '#10b981', rate: 0.8 + (r - 4) * 0.2, label: `Grade C (+${(0.8 + (r - 4) * 0.2).toFixed(1)}/Lv) Moderate` };
            return { grade: 'E', color: '#94a3b8', rate: Math.max(0.2, r * 0.2), label: `Grade E (+${(r * 0.2).toFixed(1)}/Lv) Low` };
        }

        function ensureItemParams(item) {
            if (!item.params || !Array.isArray(item.params) || item.params.length < 8) {
                item.params = [0, 0, 0, 0, 0, 0, 0, 0];
            }
        }

        function ensureClassParams(cls) {
            if (!cls.params || !Array.isArray(cls.params) || cls.params.length < 8) {
                cls.params = [
                    Array(100).fill(400), Array(100).fill(40),
                    Array(100).fill(15), Array(100).fill(15),
                    Array(100).fill(10), Array(100).fill(10),
                    Array(100).fill(12), Array(100).fill(10)
                ];
            }
            for (let p = 0; p < 8; p++) {
                if (!Array.isArray(cls.params[p]) || cls.params[p].length < 100) {
                    const arr = Array(100).fill(10);
                    if (Array.isArray(cls.params[p])) {
                        for (let i = 0; i < cls.params[p].length; i++) arr[i] = cls.params[p][i];
                    }
                    cls.params[p] = arr;
                }
            }
        }

        // Universal Notetag Utilities
        function getTagVal(note, tag, defVal = '') {
            if (!note) return defVal;
            const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const m = note.match(new RegExp('<' + escaped + ':[ ]*(.+?)>', 'i'));
            return m ? m[1].trim() : defVal;
        }

        function hasTag(note, tag) {
            if (!note) return false;
            const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return new RegExp('<' + escaped + '>', 'i').test(note);
        }

        function getActiveItem() {
            const items = getActiveList();
            return items[State.selectedIndex] || null;
        }

        function setTagVal(itemOrTag, tagOrVal, maybeVal) {
            let item, tag, val;
            if (maybeVal !== undefined) {
                item = (typeof itemOrTag === 'object' && itemOrTag) ? itemOrTag : (window.currentItem || getActiveItem());
                tag = tagOrVal;
                val = maybeVal;
            } else {
                item = window.currentItem || getActiveItem();
                tag = itemOrTag;
                val = tagOrVal;
            }
            if (!item) return;

            let note = item.note || '';
            const escaped = String(tag).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp('<' + escaped + ':[ ]*.*?>\\n?', 'gi');
            note = note.replace(regex, '').trim();
            if (val !== null && val !== undefined && String(val).trim() !== '') {
                note = `<${tag}: ${String(val).trim()}>\n` + note;
            }
            item.note = note.trim();
            setUnsaved(true);
            updateRawNoteTextarea();
        }

        function setBoolTag(itemOrTag, tagOrBool, maybeBool) {
            let item, tag, enabled;
            if (maybeBool !== undefined) {
                item = (typeof itemOrTag === 'object' && itemOrTag) ? itemOrTag : (window.currentItem || getActiveItem());
                tag = tagOrBool;
                enabled = maybeBool;
            } else {
                item = window.currentItem || getActiveItem();
                tag = itemOrTag;
                enabled = tagOrBool;
            }
            if (!item) return;

            let note = item.note || '';
            const escaped = String(tag).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp('<' + escaped + '>\\n?', 'gi');
            note = note.replace(regex, '').trim();
            if (enabled) {
                note = `<${tag}>\n` + note;
            }
            item.note = note.trim();
            setUnsaved(true);
            updateRawNoteTextarea();
        }

        function setBlockTag(itemOrTag, tagOrContent, maybeContent) {
            let item, tag, content;
            if (maybeContent !== undefined) {
                item = (typeof itemOrTag === 'object' && itemOrTag) ? itemOrTag : (window.currentItem || getActiveItem());
                tag = tagOrContent;
                content = maybeContent;
            } else {
                item = window.currentItem || getActiveItem();
                tag = itemOrTag;
                content = tagOrContent;
            }
            if (!item) return;

            let note = item.note || '';
            const escaped = String(tag).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp('<' + escaped + '>[\\s\\S]*?<\\/' + escaped + '>\\n?', 'gi');
            note = note.replace(regex, '').trim();
            if (content && String(content).trim()) {
                note = `<${tag}>\n${String(content).trim()}\n</${tag}>\n` + note;
            }
            item.note = note.trim();
            setUnsaved(true);
            updateRawNoteTextarea();
        }

        function getBlockTag(note, tag, defVal = '') {
            if (!note) return defVal;
            const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const m = note.match(new RegExp('<' + escaped + '>([\\s\\S]*?)<\\/' + escaped + '>', 'i'));
            return m ? m[1].trim() : defVal;
        }

        function updateRawNoteTextarea() {
            const el = document.getElementById('rawNoteTextarea');
            const items = getActiveList();
            const item = items[State.selectedIndex];
            if (el && item) {
                el.value = item.note || '';
            }
        }

        function onRawNoteInput(val) {
            const items = getActiveList();
            const item = items[State.selectedIndex];
            if (!item) return;
            item.note = val;
            setUnsaved(true);
            renderEditor();
        }

        function getApiUrl(endpoint) {
            // If running from file://, origin null, or different port/host (e.g. Live Server on 5500),
            // always route API requests to the Python editor server on port 5050 using 127.0.0.1 to avoid IPv6 issues.
            if (window.location.protocol === 'file:' || window.location.origin === 'null' || window.location.port !== '5050') {
                return 'http://127.0.0.1:5050' + endpoint;
            }
            return endpoint;
        }

        function showServerOfflineModal() {
            if (document.getElementById('serverOfflineBanner')) return;
            const modal = document.createElement('div');
            modal.id = 'serverOfflineBanner';
            modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);padding:20px;';
            modal.innerHTML = `
                <div style="background:#1e293b;border:2px solid #ef4444;border-radius:12px;max-width:580px;width:100%;padding:24px;box-shadow:0 20px 40px rgba(0,0,0,0.8);color:#f8fafc;">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
                        <div style="font-size:2.2rem;">⚠️</div>
                        <div>
                            <h2 style="font-size:1.25rem;font-weight:700;color:#f87171;">Server Database Belum Berjalan / Tidak Terhubung</h2>
                            <p style="font-size:0.85rem;color:#94a3b8;">Tidak dapat memuat file JSON database project</p>
                        </div>
                    </div>
                    <p style="font-size:0.9rem;line-height:1.5;margin-bottom:16px;color:#cbd5e1;">
                        Editor web ini memerlukan backend lokal (<strong>tools/nusv_editor_server.py</strong>) agar dapat membaca data game dan menyimpan perubahan langsung ke file JSON project.
                    </p>
                    <div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:12px;font-family:monospace;font-size:0.85rem;margin-bottom:20px;line-height:1.7;">
                        <div style="color:#38bdf8;font-weight:600;margin-bottom:4px;">Cara Menjalankan Server Backend:</div>
                        <div>🐧 <strong>Linux:</strong> Jalankan <code>./run_editor.sh</code> di terminal</div>
                        <div>🪟 <strong>Windows:</strong> Double-click <code>run_editor.bat</code></div>
                        <div style="margin-top:6px;color:#94a3b8;">Atau ketik: <code>python3 tools/nusv_editor_server.py</code></div>
                    </div>
                    <div style="display:flex;gap:10px;justify-content:flex-end;">
                        <button class="btn btn-secondary" onclick="document.getElementById('serverOfflineBanner').remove()">Tutup Notifikasi</button>
                        <a href="http://localhost:5050/" class="btn btn-primary" style="text-decoration:none;display:inline-flex;align-items:center;">🌐 Buka http://localhost:5050</a>
                        <a href="http://127.0.0.1:5050/" class="btn btn-secondary" style="text-decoration:none;display:inline-flex;align-items:center;">🌐 Buka 127.0.0.1</a>
                        <button class="btn btn-secondary" onclick="reloadAllData()">🔄 Coba Hubungkan Ulang</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        // Initialize application with auto-detection for file:// protocol
        window.addEventListener('DOMContentLoaded', async () => {
            if (window.location.protocol === 'file:' || window.location.origin === 'null') {
                // If running directly from file://, probe local server to bypass CORS/Private Network restrictions
                const pingUrl = 'http://localhost:5050/api/ping.png?t=' + Date.now();
                const ping127Url = 'http://127.0.0.1:5050/api/ping.png?t=' + Date.now();
                let redirected = false;

                const tryRedirect = (url) => {
                    if (redirected) return;
                    redirected = true;
                    showToast('Terhubung ke database server! Mengalihkan ke http://localhost:5050...', 'success');
                    setTimeout(() => {
                        window.location.href = url;
                    }, 50);
                };

                const img = new Image();
                img.onload = () => tryRedirect('http://localhost:5050/');
                img.onerror = () => {
                    const img2 = new Image();
                    img2.onload = () => tryRedirect('http://127.0.0.1:5050/');
                    img2.onerror = () => {
                        showServerOfflineModal();
                    };
                    img2.src = ping127Url;
                };
                img.src = pingUrl;
                return;
            }

            await reloadAllData();
        });

        async function reloadAllData() {
            showToast('Loading project database...', 'info');
            let dataLoaded = false;
            try {
                const [pics, faces, chars, svs, enes, act, cls, wep, arm, ski, itm, ene, sta, anim, sys] = await Promise.all([
                    fetch(getApiUrl('/api/images/pictures')).then(r => r.json()).catch(() => []),
                    fetch(getApiUrl('/api/images/faces')).then(r => r.json()).catch(() => []),
                    fetch(getApiUrl('/api/images/characters')).then(r => r.json()).catch(() => []),
                    fetch(getApiUrl('/api/images/sv_actors')).then(r => r.json()).catch(() => []),
                    fetch(getApiUrl('/api/images/enemies')).then(r => r.json()).catch(() => []),
                    fetch(getApiUrl('/api/data/Actors.json')).then(r => { if (!r.ok) throw new Error('Failed to load Actors.json'); return r.json(); }),
                    fetch(getApiUrl('/api/data/Classes.json')).then(r => { if (!r.ok) throw new Error('Failed to load Classes.json'); return r.json(); }),
                    fetch(getApiUrl('/api/data/Weapons.json')).then(r => { if (!r.ok) throw new Error('Failed to load Weapons.json'); return r.json(); }),
                    fetch(getApiUrl('/api/data/Armors.json')).then(r => { if (!r.ok) throw new Error('Failed to load Armors.json'); return r.json(); }),
                    fetch(getApiUrl('/api/data/Skills.json')).then(r => { if (!r.ok) throw new Error('Failed to load Skills.json'); return r.json(); }),
                    fetch(getApiUrl('/api/data/Items.json')).then(r => { if (!r.ok) throw new Error('Failed to load Items.json'); return r.json(); }),
                    fetch(getApiUrl('/api/data/Enemies.json')).then(r => { if (!r.ok) throw new Error('Failed to load Enemies.json'); return r.json(); }),
                    fetch(getApiUrl('/api/data/States.json')).then(r => { if (!r.ok) throw new Error('Failed to load States.json'); return r.json(); }),
                    fetch(getApiUrl('/api/data/Animations.json')).then(r => r.json()).catch(() => []),
                    fetch(getApiUrl('/api/data/System.json')).then(r => r.json()).catch(() => ({}))
                ]);

                State.pictures = pics || [];
                State.faces = faces || [];
                State.characters = chars || [];
                State.svActors = svs || [];
                State.enemiesPics = enes || [];

                State.actors = act || [];
                State.classes = cls || [];
                State.weapons = wep || [];
                State.armors = arm || [];
                State.skills = ski || [];
                State.items = itm || [];
                State.enemies = ene || [];
                State.states = sta || [];
                State.animations = anim || [];
                State.system = sys || {};

                dataLoaded = true;
                const banner = document.getElementById('serverOfflineBanner');
                if (banner) banner.remove();
            } catch (err) {
                console.error('Fetch error:', err);
                showToast('Failed to load data. Ensure tools/nusv_editor_server.py is running!', 'error');
                showServerOfflineModal();
                return;
            }

            if (dataLoaded) {
                try {
                    setUnsaved(false);
                    renderSidebar();
                    renderEditor();
                    showToast('Database loaded successfully!', 'success');
                } catch (renderErr) {
                    console.error('Render error:', renderErr);
                    showToast('Render error: ' + renderErr.message, 'error');
                }
            }
        }

        function switchTab(tabKey) {
            State.currentTab = tabKey;
            State.selectedIndex = 1;
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('onclick').includes(tabKey));
            });
            document.getElementById('searchInput').value = '';
            renderSidebar();
            renderEditor();
        }

        function getActiveList() {
            switch (State.currentTab) {
                case 'actors': return State.actors;
                case 'classes': return State.classes;
                case 'weapons': return State.weapons;
                case 'armors': return State.armors;
                case 'skills': return State.skills;
                case 'items': return State.items;
                case 'enemies': return State.enemies;
                case 'states': return State.states;
                default: return [];
            }
        }

        function renderSidebar() {
            const listEl = document.getElementById('sidebarList');
            listEl.innerHTML = '';
            const items = getActiveList();
            const query = (document.getElementById('searchInput').value || '').toLowerCase();

            const filterContainer = document.getElementById('sidebarFilters');
            if (filterContainer) {
                if (State.currentTab === 'armors') {
                    filterContainer.style.display = 'flex';
                    const f = State.armorSlotFilter || 'all';
                    filterContainer.innerHTML = `
                        <button class="filter-pill ${f === 'all' ? 'active' : ''}" onclick="State.armorSlotFilter='all'; renderSidebar();" title="Tampilkan semua kategori perlengkapan">All</button>
                        <button class="filter-pill ${f === '6' ? 'active' : ''}" onclick="State.armorSlotFilter='6'; renderSidebar();" title="Tampilkan slot Aksesoris (Slot 6)">💍 Accessories</button>
                        <button class="filter-pill ${f === '2' ? 'active' : ''}" onclick="State.armorSlotFilter='2'; renderSidebar();" title="Tampilkan slot Perisai / Tangan Kiri (Slot 2)">🛡️ Shields</button>
                        <button class="filter-pill ${f === '3' ? 'active' : ''}" onclick="State.armorSlotFilter='3'; renderSidebar();" title="Tampilkan slot Pelindung Kepala (Slot 3)">🎩 Helms</button>
                        <button class="filter-pill ${f === '4' ? 'active' : ''}" onclick="State.armorSlotFilter='4'; renderSidebar();" title="Tampilkan slot Baju Zirah (Slot 4)">🥋 Body Armor</button>
                        <button class="filter-pill ${f === '5' ? 'active' : ''}" onclick="State.armorSlotFilter='5'; renderSidebar();" title="Tampilkan slot Sepatu / Kaki (Slot 5)">👢 Boots</button>
                        <button class="filter-pill ${f === '7' ? 'active' : ''}" onclick="State.armorSlotFilter='7'; renderSidebar();" title="Tampilkan slot Pusaka / Relik (Slot 7)">🔮 Relics</button>
                    `;
                } else {
                    filterContainer.style.display = 'none';
                }
            }

            items.forEach((item, index) => {
                if (!item) return;
                if (State.currentTab === 'armors' && State.armorSlotFilter && State.armorSlotFilter !== 'all') {
                    if (String(item.etypeId) !== String(State.armorSlotFilter)) return;
                }
                if (query && !String(item.name).toLowerCase().includes(query) && !String(item.id).includes(query)) {
                    return;
                }

                const div = document.createElement('div');
                div.className = `list-item ${index === State.selectedIndex ? 'active' : ''}`;
                div.onclick = () => {
                    State.selectedIndex = index;
                    renderSidebar();
                    renderEditor();
                };

                let extraTag = '';
                if (State.currentTab === 'classes') {
                    const t = getTagVal(item.note, 'Class Tier', '1');
                    extraTag = `<span class="list-badge">T${t}</span>`;
                } else if (State.currentTab === 'weapons' || State.currentTab === 'armors' || State.currentTab === 'items') {
                    const r = getTagVal(item.note, 'NUSV Rarity', '');
                    if (r) extraTag = `<span class="list-badge">${escapeHtml(r)}</span>`;
                } else if (State.currentTab === 'states') {
                    const ty = getTagVal(item.note, 'NUSV Type', '');
                    if (ty === '1') extraTag = `<span class="list-badge" style="color:var(--green)">Buff</span>`;
                    else if (ty === '2') extraTag = `<span class="list-badge" style="color:var(--red)">Debuff</span>`;
                    else if (ty === '3') extraTag = `<span class="list-badge" style="color:var(--purple)">Passive</span>`;
                }

                div.innerHTML = `
                    <span class="list-id">#${item.id}</span>
                    <span class="list-name">${escapeHtml(item.name || '(Empty)')}</span>
                    ${extraTag}
                `;
                listEl.appendChild(div);
            });
        }

        function filterItems() {
            renderSidebar();
        }

        function renderEditor() {
            const container = document.getElementById('panelContainer');
            const previewContainer = document.getElementById('statPreviewContainer');
            const statTitle = document.getElementById('statSidebarTitle');
            const statSub = document.getElementById('statSidebarSubtitle');
            const items = getActiveList();
            const item = items[State.selectedIndex];

            if (!item) {
                container.innerHTML = `<div style="text-align:center; padding:60px; color:var(--text-muted);" title="Silakan pilih salah satu data di sidebar sebelah kiri untuk mulai mengedit">Select an item from the left sidebar to edit.</div>`;
                if (previewContainer) previewContainer.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-muted);">Pilih item dari daftar untuk melihat pratinjau stat.</div>`;
                return;
            }

            // Expose active item to window scope so inline event handlers (e.g. setTagVal(cls, ...))
            // always find the current object without throwing ReferenceError
            window.currentItem = item;
            window.actor = item;
            window.cls = item;
            window.weapon = item;
            window.armor = item;
            window.skill = item;
            window.item = item;
            window.enemy = item;
            window.state = item;

            switch (State.currentTab) {
                case 'actors': 
                    if (statTitle) statTitle.innerHTML = '📊 Hasil Stat Akhir &amp; Build';
                    if (statSub) statSub.innerText = 'Dual-Level Simulation';
                    renderActorEditor(container, item); 
                    if (previewContainer) renderActorStatPreview(previewContainer, item);
                    break;
                case 'classes': 
                    if (statTitle) statTitle.innerHTML = '📈 Class Stat Scaling (IV)';
                    if (statSub) statSub.innerText = 'Job Level Simulation';
                    renderClassEditor(container, item); 
                    if (previewContainer) renderClassStatPreview(previewContainer, item);
                    break;
                case 'weapons': 
                    if (statTitle) statTitle.innerHTML = '⚔️ Weapon Stat Inspector';
                    if (statSub) statSub.innerText = 'Equipment Power & Attributes';
                    renderWeaponEditor(container, item); 
                    if (previewContainer) renderEquipmentStatPreview(previewContainer, item, 'weapon');
                    break;
                case 'armors': 
                    if (statTitle) statTitle.innerHTML = '🛡️ Armor Stat Inspector';
                    if (statSub) statSub.innerText = 'Defense & Stat Modifiers';
                    renderArmorEditor(container, item); 
                    if (previewContainer) renderEquipmentStatPreview(previewContainer, item, 'armor');
                    break;
                case 'skills': 
                    if (statTitle) statTitle.innerHTML = '📖 Skill Inspector';
                    if (statSub) statSub.innerText = 'Combat Resolution & Scope';
                    renderSkillEditor(container, item); 
                    if (previewContainer) renderSkillStatPreview(previewContainer, item);
                    break;
                case 'items': 
                    if (statTitle) statTitle.innerHTML = '🧪 Item Inspector';
                    if (statSub) statSub.innerText = 'Effect & Value Preview';
                    renderItemEditor(container, item); 
                    if (previewContainer) renderItemStatPreview(previewContainer, item);
                    break;
                case 'enemies': 
                    if (statTitle) statTitle.innerHTML = '👾 Enemy Combat Stats';
                    if (statSub) statSub.innerText = 'Combat Balance & Drops';
                    renderEnemyEditor(container, item); 
                    if (previewContainer) renderEnemyStatPreview(previewContainer, item);
                    break;
                case 'states': 
                    if (statTitle) statTitle.innerHTML = '✨ State / Status Effect';
                    if (statSub) statSub.innerText = 'Buff / Debuff / Passive';
                    renderStateEditor(container, item); 
                    if (previewContainer) renderStateStatPreview(previewContainer, item);
                    break;
            }
        }

        // =====================================================================
        // ACTOR STAT SIMULATION ENGINE
        // =====================================================================
        function parsePercent(val) {
            if (!val) return 0;
            const clean = String(val).replace('%', '').trim();
            const num = parseFloat(clean);
            return isNaN(num) ? 0 : num / 100.0;
        }

        function parseBonusNum(val) {
            if (!val) return 0;
            const clean = String(val).replace('+', '').trim();
            const num = parseFloat(clean);
            return isNaN(num) ? 0 : num;
        }

        function getActorEquippedItems(actor) {
            const items = [];
            actor.equips = actor.equips || [0, 0, 0, 0, 0, 0, 0];

            if (actor.equips[0] && State.weapons[actor.equips[0]]) {
                items.push({ slot: 'Weapon', item: State.weapons[actor.equips[0]] });
            }

            if (actor.equips[1]) {
                const sId = actor.equips[1];
                if (State.weapons[sId] && (State.weapons[sId].note || '').includes('Secondary')) {
                    items.push({ slot: 'Secondary Weapon', item: State.weapons[sId] });
                } else if (State.armors[sId]) {
                    items.push({ slot: 'Secondary / Shield', item: State.armors[sId] });
                }
            }

            const slotMap = { 2: 'Helm', 3: 'Armor', 4: 'Boots', 5: 'Accessory 1' };
            for (let i = 2; i <= 5; i++) {
                if (actor.equips[i] && State.armors[actor.equips[i]]) {
                    items.push({ slot: slotMap[i], item: State.armors[actor.equips[i]] });
                }
            }

            const secAccVal = getTagVal(actor.note, 'Second Accessory') || getTagVal(actor.note, 'Accessory 2');
            if (secAccVal) {
                const a2 = State.armors.find(a => a && (a.name === secAccVal || String(a.id) === secAccVal));
                if (a2) items.push({ slot: 'Accessory 2', item: a2 });
            }

            if (actor.equips[6] && State.armors[actor.equips[6]]) {
                items.push({ slot: 'Relic', item: State.armors[actor.equips[6]] });
            }

            return items;
        }

        function calculateActorSimulation(actor, baseLevel = 1, classLevel = 1) {
            const cls = State.classes[actor.classId] || {};
            const equipped = getActorEquippedItems(actor);
            const note = actor.note || '';
            const classNote = cls.note || '';

            const eqParams = [0, 0, 0, 0, 0, 0, 0, 0];
            const eqCore = { STR: 0, INT: 0, DEX: 0, AGI: 0, VIT: 0, LUK: 0 };
            let eqMaxSP = 0;
            let eqHit = 0, eqEva = 0, eqCri = 0, eqCdmg = 0, eqCev = 0;
            let eqGrd = 0, eqHrg = 0, eqMrg = 0, eqTrg = 0;
            let eqArmPen = 0, eqMagPen = 0, eqPdr = 0, eqMdr = 0;
            let eqCnt = 0, eqMev = 0, eqMrf = 0, eqMcr = 0, eqTgr = 0;
            const amplifiedElements = [];
            const setCounts = {};

            equipped.forEach(({ item }) => {
                if (!item) return;
                const inote = item.note || '';

                if (Array.isArray(item.params)) {
                    for (let p = 0; p < 8; p++) {
                        eqParams[p] += (item.params[p] || 0);
                    }
                }

                CORE_ATTRIBUTES.forEach(a => {
                    eqCore[a.code] += parseBonusNum(getTagVal(inote, a.code));
                });

                eqMaxSP += parseBonusNum(getTagVal(inote, 'Max SP'));
                eqHit += parsePercent(getTagVal(inote, 'HIT Plus'));
                eqEva += parsePercent(getTagVal(inote, 'EVA Plus'));
                eqCri += parsePercent(getTagVal(inote, 'CRI Plus'));
                eqCdmg += parsePercent(getTagVal(inote, 'Critical Damage'));
                eqCev += parsePercent(getTagVal(inote, 'CEV Plus'));
                eqGrd += parsePercent(getTagVal(inote, 'GRD Plus'));
                eqHrg += parsePercent(getTagVal(inote, 'HRG Plus'));
                eqMrg += parsePercent(getTagVal(inote, 'MRG Plus'));
                eqTrg += parsePercent(getTagVal(inote, 'TRG Plus'));
                eqArmPen += parsePercent(getTagVal(inote, 'Armor Penetration'));
                eqMagPen += parsePercent(getTagVal(inote, 'Magic Penetration'));
                eqPdr += parsePercent(getTagVal(inote, 'PDR Plus'));
                eqMdr += parsePercent(getTagVal(inote, 'MDR Plus'));
                eqCnt += parsePercent(getTagVal(inote, 'CNT Plus'));
                eqMev += parsePercent(getTagVal(inote, 'MEV Plus'));
                eqMrf += parsePercent(getTagVal(inote, 'MRF Plus'));
                eqMcr += parsePercent(getTagVal(inote, 'MCR Plus'));
                eqTgr += parsePercent(getTagVal(inote, 'TGR Plus'));

                const eMatch = inote.match(/<Element Amplify ([a-zA-Z]+):[ ]*(.+?)>/i);
                if (eMatch) {
                    amplifiedElements.push(`${eMatch[1]} ${eMatch[2]}`);
                }

                const sName = getTagVal(inote, 'NUSV Set Name');
                if (sName) {
                    setCounts[sName] = (setCounts[sName] || 0) + 1;
                }
            });

            // 1. Base Core Stats (Actor Innate Species Base) & Class IV Scaling (1 - 10)
            const actorBaseCore = {};
            const classIVRating = {};
            const classGrowthRates = { STR: 0, INT: 0, DEX: 0, AGI: 0, VIT: 0, LUK: 0 };
            const baseCore = {};

            const classGrowthStr = getTagVal(classNote, 'Class Stat Growth', '');
            if (classGrowthStr) {
                classGrowthStr.split(',').forEach(part => {
                    const p = part.trim();
                    let m = p.match(/\+?\s*([\d.]+)\s*([A-Za-z]{3})/);
                    if (m) {
                        const code = m[2].toUpperCase();
                        if (classGrowthRates[code] !== undefined) classGrowthRates[code] = parseFloat(m[1]) || 0;
                        return;
                    }
                    m = p.match(/([A-Za-z]{3})\s*\+?\s*([\d.]+)/);
                    if (m) {
                        const code = m[1].toUpperCase();
                        if (classGrowthRates[code] !== undefined) classGrowthRates[code] = parseFloat(m[2]) || 0;
                    }
                });
            }

            CORE_ATTRIBUTES.forEach(a => {
                // Actor's innate species base stat (ditulis di tab Actor)
                const actBase = parseInt(getTagVal(note, `Base ${a.code}`), 10);
                actorBaseCore[a.code] = !isNaN(actBase) ? actBase : 10;

                // Class IV Rating (1 - 10, ditulis di tab Class)
                const rawCls = parseInt(getTagVal(classNote, `Base ${a.code}`), 10);
                const iv = (!isNaN(rawCls) && rawCls >= 1 && rawCls <= 10) ? rawCls : Math.min(10, Math.max(1, rawCls || 5));
                classIVRating[a.code] = iv;

                // Jika tidak ada notetag manual Class Stat Growth untuk stat ini, hitung otomatis dari IV (1-10) -> (IV / 5) per level
                if (!classGrowthRates[a.code]) {
                    classGrowthRates[a.code] = Math.round((iv / 5) * 10) / 10;
                }

                // Total Base pondasi awal di Lv 1 = Actor Base + Class IV bonus
                baseCore[a.code] = actorBaseCore[a.code] + iv;
            });

            // 2. Actor Stat Growth (Innate scaling with Base Level)
            const actorGrowthRates = { STR: 0, INT: 0, DEX: 0, AGI: 0, VIT: 0, LUK: 0 };
            const actorGrowthStr = getTagVal(note, 'Actor Stat Growth');
            if (actorGrowthStr) {
                actorGrowthStr.split(',').forEach(part => {
                    const p = part.trim();
                    let m = p.match(/\+?\s*([\d.]+)\s*([A-Za-z]{3})/);
                    if (m) {
                        const code = m[2].toUpperCase();
                        if (actorGrowthRates[code] !== undefined) actorGrowthRates[code] = parseFloat(m[1]) || 0;
                        return;
                    }
                    m = p.match(/([A-Za-z]{3})\s*\+?\s*([\d.]+)/);
                    if (m) {
                        const code = m[1].toUpperCase();
                        if (actorGrowthRates[code] !== undefined) actorGrowthRates[code] = parseFloat(m[2]) || 0;
                    }
                });
            }

            // 4. Calculate Final 6 Core Attributes
            const actorGrowthCore = {};
            const classGrowthCore = {};
            const totalCore = {};

            CORE_ATTRIBUTES.forEach(a => {
                const actGrowth = Math.round(actorGrowthRates[a.code] * (baseLevel - 1) * 10) / 10;
                const clsGrowth = Math.round(classGrowthRates[a.code] * (classLevel - 1) * 10) / 10;
                actorGrowthCore[a.code] = actGrowth;
                classGrowthCore[a.code] = clsGrowth;

                totalCore[a.code] = Math.max(1, Math.round(baseCore[a.code] + actGrowth + clsGrowth + eqCore[a.code]));
            });

            ensureClassParams(cls);
            const classMhp = (cls.params && cls.params[0] && cls.params[0][baseLevel]) ? cls.params[0][baseLevel] : 450;
            const classMmp = (cls.params && cls.params[1] && cls.params[1][baseLevel]) ? cls.params[1][baseLevel] : 40;

            const totalMhp = Math.round(classMhp + (totalCore.VIT * 15) + (totalCore.STR * 5) + eqParams[0]);
            const totalMmp = Math.round(classMmp + (totalCore.INT * 8) + eqParams[1]);
            const totalMsp = Math.round(50 + (totalCore.VIT * 5) + (totalCore.STR * 2) + eqMaxSP);

            const mainWeap = State.weapons[actor.equips[0]];
            const isFinesse = mainWeap && (/finesse|bow|dagger|crossbow|whip/i.test(mainWeap.note || '') || mainWeap.wtypeId === 7 || mainWeap.wtypeId === 8);

            const classAtk = (cls.params && cls.params[2] && cls.params[2][baseLevel]) ? cls.params[2][baseLevel] : 10;
            const totalAtk = isFinesse ? Math.round(classAtk + (totalCore.DEX * 2) + (totalCore.STR * 0.5) + eqParams[2])
                                       : Math.round(classAtk + (totalCore.STR * 2) + (totalCore.DEX * 0.5) + eqParams[2]);

            const classDef = (cls.params && cls.params[3] && cls.params[3][baseLevel]) ? cls.params[3][baseLevel] : 15;
            const totalDef = Math.round(classDef + (totalCore.VIT * 1.5) + (totalCore.STR * 0.5) + eqParams[3]);

            const classMat = (cls.params && cls.params[4] && cls.params[4][baseLevel]) ? cls.params[4][baseLevel] : 10;
            const totalMat = Math.round(classMat + (totalCore.INT * 2) + eqParams[4]);

            const classMdf = (cls.params && cls.params[5] && cls.params[5][baseLevel]) ? cls.params[5][baseLevel] : 10;
            const totalMdf = Math.round(classMdf + (totalCore.INT * 1.2) + (totalCore.VIT * 0.8) + eqParams[5]);

            const classAgi = (cls.params && cls.params[6] && cls.params[6][baseLevel]) ? cls.params[6][baseLevel] : 10;
            const totalAgi = Math.round(classAgi + (totalCore.AGI * 1.5) + eqParams[6]);

            const classLuk = (cls.params && cls.params[7] && cls.params[7][baseLevel]) ? cls.params[7][baseLevel] : 10;
            const totalLuk = Math.round(classLuk + totalCore.LUK + eqParams[7]);

            const hitRate = Math.min(1.0, 0.85 + (totalCore.DEX * 0.002) + eqHit);
            const evaRate = Math.min(0.80, 0.02 + (totalCore.AGI * 0.002) + (totalCore.LUK * 0.0005) + eqEva);
            const critRate = Math.min(0.85, 0.03 + (totalCore.DEX * 0.002) + (totalCore.LUK * 0.001) + eqCri);
            const critDmg = 1.50 + (totalCore.STR * 0.003) + (totalCore.DEX * 0.002) + eqCdmg;
            const critEva = (totalCore.LUK * 0.0015) + (totalCore.VIT * 0.001) + eqCev;
            const guardEff = 1.00 + (totalCore.VIT * 0.005) + eqGrd;

            const hpRegen = (totalCore.VIT * 0.0003) + eqHrg;
            const mpRegen = (totalCore.INT * 0.0003) + eqMrg;
            const spRegen = 0.03 + (totalCore.AGI * 0.0004) + (totalCore.VIT * 0.0002) + eqTrg;
            const targetRate = 1.00 + eqTgr;

            const activeSets = [];
            Object.keys(setCounts).forEach(sName => {
                const count = setCounts[sName];
                if (count >= 2) {
                    activeSets.push(`${sName} (${count}-Piece Active)`);
                }
            });

            return {
                baseLevel,
                classLevel,
                cls,
                isFinesse,
                actorBaseCore,
                classIVRating,
                classBaseCore: classIVRating,
                baseCore,
                actorGrowthRates,
                classGrowthRates,
                actorGrowthCore,
                classGrowthCore,
                eqCore,
                totalCore,
                classMhp,
                totalMhp,
                classMmp,
                totalMmp,
                totalMsp,
                totalAtk,
                totalDef,
                totalMat,
                totalMdf,
                totalAgi,
                totalLuk,
                hitRate,
                evaRate,
                critRate,
                critDmg,
                critEva,
                guardEff,
                hpRegen,
                mpRegen,
                spRegen,
                armPen: eqArmPen,
                magPen: eqMagPen,
                pdr: eqPdr,
                mdr: eqMdr,
                cnt: eqCnt,
                mev: eqMev,
                mrf: eqMrf,
                mcr: eqMcr,
                targetRate,
                amplifiedElements,
                activeSets,
                equippedCount: equipped.length
            };
        }

        function onActorSimBaseLevelChange(lvl) {
            const val = Math.max(1, Math.min(99, parseInt(lvl, 10) || 1));
            State.actorSimBaseLevel = val;
            const badge = document.getElementById('actorSimBaseBadge');
            if (badge) badge.innerText = `Base Lv ${val}`;
            const slider = document.getElementById('actorSimBaseSlider');
            if (slider && parseInt(slider.value, 10) !== val) slider.value = val;
            const input = document.getElementById('actorSimBaseInput');
            if (input && parseInt(input.value, 10) !== val) input.value = val;
            updateActorSimulationLive();
        }

        function onActorSimClassLevelChange(lvl) {
            const actor = State.actors[State.selectedIndex];
            const cls = actor ? (State.classes[actor.classId] || {}) : {};
            const classTier = getTagVal(cls.note, 'Class Tier', '1');
            const customMax = parseInt(getTagVal(cls.note, 'Class Max Level'), 10);
            const tierCaps = { '1': 10, '2': 30, '3': 40, '4': 50, '5': 60, '6': 99 };
            const maxLvl = customMax || tierCaps[classTier] || 10;

            const val = Math.max(1, Math.min(maxLvl, parseInt(lvl, 10) || 1));
            State.actorSimClassLevel = val;
            const badge = document.getElementById('actorSimClassBadge');
            if (badge) badge.innerText = `Class Lv ${val} / ${maxLvl}`;
            const slider = document.getElementById('actorSimClassSlider');
            if (slider && parseInt(slider.value, 10) !== val) slider.value = val;
            const input = document.getElementById('actorSimClassInput');
            if (input && parseInt(input.value, 10) !== val) input.value = val;
            updateActorSimulationLive();
        }

        function onActorSimLevelChange(lvl) {
            onActorSimBaseLevelChange(lvl);
        }

        function onActorBaseStatInput(actorOrCode, codeOrVal, maybeVal) {
            let actor, code, val;
            if (maybeVal !== undefined) {
                actor = (typeof actorOrCode === 'object' && actorOrCode) ? actorOrCode : (window.currentItem || getActiveItem());
                code = codeOrVal;
                val = maybeVal;
            } else {
                actor = window.currentItem || getActiveItem();
                code = actorOrCode;
                val = codeOrVal;
            }
            if (!actor) return;
            const num = parseInt(val, 10);
            if (!isNaN(num) && num >= 0) {
                setTagVal(actor, `Base ${code}`, num);
            } else if (val === '') {
                setTagVal(actor, `Base ${code}`, '');
            }
            updateActorSimulationLive();
        }

        function onClassIVInput(code, val) {
            const cls = window.currentItem || getActiveItem();
            if (!cls) return;
            let num = parseInt(val, 10);
            if (isNaN(num)) num = 5;
            num = Math.max(1, Math.min(10, num));
            setTagVal(cls, `Base ${code}`, num);

            // Update live grade badge in middle column
            const info = getIVGradeInfo(num);
            const lbl = document.getElementById(`cls-iv-label-${code}`);
            if (lbl) {
                lbl.innerText = `+${info.rate.toFixed(1)}/Lv`;
                lbl.style.color = info.color;
            }
            const gradeBadge = document.getElementById(`cls-iv-grade-${code}`);
            if (gradeBadge) {
                gradeBadge.innerText = `Grade ${info.grade}`;
                gradeBadge.style.background = info.color;
            }

            updateClassSimulationLive();
        }

        function onClassBaseStatInput(clsOrCode, codeOrVal, maybeVal) {
            let cls, code, val;
            if (maybeVal !== undefined) {
                cls = (typeof clsOrCode === 'object' && clsOrCode) ? clsOrCode : (window.currentItem || getActiveItem());
                code = codeOrVal;
                val = maybeVal;
            } else {
                cls = window.currentItem || getActiveItem();
                code = clsOrCode;
                val = codeOrVal;
            }
            if (!cls) return;
            return onClassIVInput(code, val);
        }

        function onClassSimLevelChange(lvl) {
            const cls = State.classes[State.selectedIndex];
            const currentTier = cls ? (parseInt(getTagVal(cls.note || '', 'Class Tier', '1'), 10) || 1) : 1;
            const defaultMaxLvl = currentTier === 1 ? 10 : (currentTier === 2 ? 30 : (currentTier === 3 ? 40 : (currentTier === 4 ? 50 : (currentTier === 5 ? 60 : 99))));
            const maxLvl = cls ? (parseInt(getTagVal(cls.note || '', 'Class Max Level', ''), 10) || defaultMaxLvl) : defaultMaxLvl;
            const val = Math.max(1, Math.min(maxLvl, parseInt(lvl, 10) || 1));
            State.classTabSimLevel = val;
            const slider = document.getElementById('classSimSlider');
            if (slider && parseInt(slider.value, 10) !== val) slider.value = val;
            const input = document.getElementById('classSimInput');
            if (input && parseInt(input.value, 10) !== val) input.value = val;
            const badge = document.getElementById('classSimLevelBadge');
            if (badge) badge.innerText = `Job Lv ${val} / ${maxLvl}`;
            updateClassSimulationLive();
        }

        function updateClassSimulationLive() {
            const cls = State.classes[State.selectedIndex];
            if (!cls) return;
            const note = cls.note || '';
            const currentTier = parseInt(getTagVal(note, 'Class Tier', '1'), 10) || 1;
            const defaultMaxLvl = currentTier === 1 ? 10 : (currentTier === 2 ? 30 : (currentTier === 3 ? 40 : (currentTier === 4 ? 50 : (currentTier === 5 ? 60 : 99))));
            const maxLvl = parseInt(getTagVal(note, 'Class Max Level', ''), 10) || defaultMaxLvl;
            const lvl = Math.max(1, Math.min(maxLvl, State.classTabSimLevel || 1));

            const growthRates = { STR: 0, INT: 0, DEX: 0, AGI: 0, VIT: 0, LUK: 0 };
            const manualGrowthStr = getTagVal(note, 'Class Stat Growth', '');
            if (manualGrowthStr) {
                manualGrowthStr.split(',').forEach(part => {
                    const p = part.trim();
                    let m = p.match(/\+?\s*([\d.]+)\s*([A-Za-z]{3})/);
                    if (m) {
                        const code = m[2].toUpperCase();
                        if (growthRates[code] !== undefined) growthRates[code] = parseFloat(m[1]) || 0;
                        return;
                    }
                    m = p.match(/([A-Za-z]{3})\s*\+?\s*([\d.]+)/);
                    if (m) {
                        const code = m[1].toUpperCase();
                        if (growthRates[code] !== undefined) growthRates[code] = parseFloat(m[2]) || 0;
                    }
                });
            }

            CORE_ATTRIBUTES.forEach(attr => {
                const rawIV = parseInt(getTagVal(note, `Base ${attr.code}`, '5'), 10) || 5;
                const iv = Math.max(1, Math.min(10, rawIV));
                const ivInfo = getIVGradeInfo(iv);

                const rate = (manualGrowthStr && growthRates[attr.code] > 0) ? growthRates[attr.code] : ivInfo.rate;
                const growth = Math.round(rate * (lvl - 1) * 10) / 10;
                const total = Math.max(1, Math.round(iv + growth));

                const el = document.getElementById(`cls-sim-${attr.code}`);
                if (el) el.innerText = total;

                const elD = document.getElementById(`cls-sim-${attr.code}-detail`);
                if (elD) {
                    if (growth > 0) {
                        elD.innerText = `IV ${iv} + Grw ${growth} (Lv ${lvl})`;
                    } else {
                        elD.innerText = `IV ${iv} (Lv 1)`;
                    }
                }
            });

            // Update Class Base Params
            ensureClassParams(cls);
            const mhpEl = document.getElementById('cls-sim-mhp');
            if (mhpEl) mhpEl.innerText = (cls.params && cls.params[0] && cls.params[0][lvl]) ? cls.params[0][lvl] : '450';
            const mmpEl = document.getElementById('cls-sim-mmp');
            if (mmpEl) mmpEl.innerText = (cls.params && cls.params[1] && cls.params[1][lvl]) ? cls.params[1][lvl] : '40';
            const defEl = document.getElementById('cls-sim-def');
            if (defEl) defEl.innerText = (cls.params && cls.params[3] && cls.params[3][lvl]) ? cls.params[3][lvl] : '15';

            // Update Unlocked Skills list
            const skillsContainer = document.getElementById('cls-sim-skills-container');
            if (skillsContainer) {
                const learnings = (cls.learnings || []).filter(l => l.level <= lvl);
                if (learnings.length === 0) {
                    skillsContainer.innerHTML = `<span style="font-size:0.75rem; color:var(--text-muted);">(Tidak ada skill yang terbuka di Lv ${lvl})</span>`;
                } else {
                    skillsContainer.innerHTML = learnings.map(l => {
                        const sk = State.skills[l.skillId];
                        const name = sk ? sk.name : `Skill #${l.skillId}`;
                        return `
                            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25); border:1px solid var(--border-color); border-radius:6px; padding:4px 8px; margin-bottom:4px; font-size:0.78rem;">
                                <div style="display:flex; align-items:center; gap:6px;">
                                    <span style="font-weight:700; color:#38bdf8;">Lv ${l.level}</span>
                                    <span>${escapeHtml(name)}</span>
                                </div>
                                <span style="font-size:0.7rem; color:var(--text-muted);">${escapeHtml(l.note || '')}</span>
                            </div>
                        `;
                    }).join('');
                }
            }
        }

        function updateActorSimulationLive() {
            const actor = State.actors[State.selectedIndex];
            if (!actor) return;
            const baseLevel = State.actorSimBaseLevel || actor.initialLevel || 1;
            const classLevel = State.actorSimClassLevel || 1;
            const res = calculateActorSimulation(actor, baseLevel, classLevel);

            const elMhp = document.getElementById('sim-mhp');
            if (elMhp) elMhp.innerText = res.totalMhp.toLocaleString();
            const elMhpD = document.getElementById('sim-mhp-detail');
            if (elMhpD) elMhpD.innerText = `Class ${res.classMhp} + VIT/STR + Eq`;

            const elMmp = document.getElementById('sim-mmp');
            if (elMmp) elMmp.innerText = res.totalMmp.toLocaleString();
            const elMmpD = document.getElementById('sim-mmp-detail');
            if (elMmpD) elMmpD.innerText = `Class ${res.classMmp} + INT + Eq`;

            const elMsp = document.getElementById('sim-msp');
            if (elMsp) elMsp.innerText = res.totalMsp.toLocaleString();
            const elMspD = document.getElementById('sim-msp-detail');
            if (elMspD) elMspD.innerText = `Base 50 + VIT/STR + Eq`;

            CORE_ATTRIBUTES.forEach(a => {
                const el = document.getElementById(`sim-core-${a.code}`);
                if (el) el.innerText = res.totalCore[a.code];
                const elD = document.getElementById(`sim-core-${a.code}-detail`);
                if (elD) {
                    const parts = [];
                    parts.push(`Act ${res.actorBaseCore[a.code]}`);
                    parts.push(`ClsIV ${res.classIVRating[a.code]}`);
                    if (res.actorGrowthCore[a.code] > 0) parts.push(`ActGrw +${res.actorGrowthCore[a.code]}`);
                    if (res.classGrowthCore[a.code] > 0) parts.push(`ClsGrw +${res.classGrowthCore[a.code]}`);
                    if (res.eqCore[a.code] !== 0) parts.push(`Eq ${res.eqCore[a.code] > 0 ? '+' : ''}${res.eqCore[a.code]}`);
                    elD.innerText = parts.join(' + ');
                }
            });

            const elAtk = document.getElementById('sim-atk');
            if (elAtk) elAtk.innerText = res.totalAtk;
            const elAtkD = document.getElementById('sim-atk-detail');
            if (elAtkD) elAtkD.innerText = res.isFinesse ? 'Base+DEX/STR+Eq' : 'Base+STR/DEX+Eq';

            const elDef = document.getElementById('sim-def');
            if (elDef) elDef.innerText = res.totalDef;
            const elMat = document.getElementById('sim-mat');
            if (elMat) elMat.innerText = res.totalMat;
            const elMdf = document.getElementById('sim-mdf');
            if (elMdf) elMdf.innerText = res.totalMdf;
            const elSpd = document.getElementById('sim-spd');
            if (elSpd) elSpd.innerText = res.totalAgi;
            const elLuk = document.getElementById('sim-luk');
            if (elLuk) elLuk.innerText = res.totalLuk;

            const updateStatBadge = (id, text) => {
                const el = document.getElementById(id);
                if (el) el.innerText = text;
            };

            updateStatBadge('sim-hit', `${(res.hitRate * 100).toFixed(1)}%`);
            updateStatBadge('sim-eva', `${(res.evaRate * 100).toFixed(1)}%`);
            updateStatBadge('sim-cri', `${(res.critRate * 100).toFixed(1)}%`);
            updateStatBadge('sim-cdmg', `${(res.critDmg * 100).toFixed(1)}%`);
            updateStatBadge('sim-cev', `${(res.critEva * 100).toFixed(1)}%`);
            updateStatBadge('sim-grd', `${(res.guardEff * 100).toFixed(1)}%`);

            updateStatBadge('sim-hrg', `+${(res.hpRegen * 100).toFixed(2)}%/T`);
            updateStatBadge('sim-mrg', `+${(res.mpRegen * 100).toFixed(2)}%/T`);
            updateStatBadge('sim-trg', `+${(res.spRegen * 100).toFixed(2)}%/T`);

            updateStatBadge('sim-armpen', res.armPen ? `${(res.armPen * 100).toFixed(0)}%` : '0%');
            updateStatBadge('sim-magpen', res.magPen ? `${(res.magPen * 100).toFixed(0)}%` : '0%');
            updateStatBadge('sim-pdr', res.pdr ? `${(res.pdr * 100).toFixed(0)}%` : '0%');
            updateStatBadge('sim-mdr', res.mdr ? `${(res.mdr * 100).toFixed(0)}%` : '0%');
            updateStatBadge('sim-cnt', res.cnt ? `${(res.cnt * 100).toFixed(0)}%` : '0%');
            updateStatBadge('sim-mev', res.mev ? `${(res.mev * 100).toFixed(0)}%` : '0%');
            updateStatBadge('sim-mrf', res.mrf ? `${(res.mrf * 100).toFixed(0)}%` : '0%');
            updateStatBadge('sim-mcr', res.mcr ? `${(res.mcr * 100).toFixed(0)}%` : '100%');
            updateStatBadge('sim-tgr', `${(res.targetRate * 100).toFixed(0)}%`);

            const extraBox = document.getElementById('sim-extra-tags');
            if (extraBox) {
                const badges = [];
                res.amplifiedElements.forEach(e => {
                    badges.push(`<span class="list-badge" style="color:#f59e0b; background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.3); padding:3px 8px;">🔥 Amplify: ${escapeHtml(e)}</span>`);
                });
                res.activeSets.forEach(s => {
                    badges.push(`<span class="list-badge" style="color:#10b981; background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.3); padding:3px 8px;">🛡️ Set: ${escapeHtml(s)}</span>`);
                });
                extraBox.innerHTML = badges.length ? badges.join(' ') : `<span style="font-size:0.75rem; color:var(--text-muted);">No elemental amplification or active set bonuses.</span>`;
            }
        }

        // =====================================================================
        // 1. ACTORS EDITOR
        // =====================================================================
        function renderActorEditor(container, actor) {
            const note = actor.note || '';
            const secAccVal = getTagVal(note, 'Second Accessory') || getTagVal(note, 'Accessory 2');
            const portrait = (getTagVal(note, 'Portrait') || getTagVal(note, 'Status Image')).replace(/\.(png|jpe?g)$/i, '');
            const isLocked = hasTag(note, 'LockActor');
            const defaultRow = getTagVal(note, 'Default Row', '1');
            const race = getTagVal(note, 'Race', '');
            const passiveState = getTagVal(note, 'Passive State', '');
            const profile = getBlockTag(note, 'Profile', actor.profile || '');

            const actorClass = State.classes[actor.classId] || { name: 'Unknown Class', note: '' };
            const actorCoreStats = {};
            const classCoreStats = {};
            CORE_ATTRIBUTES.forEach(a => {
                actorCoreStats[a.code] = getTagVal(note, `Base ${a.code}`, '0');
                classCoreStats[a.code] = getTagVal(actorClass.note || '', `Base ${a.code}`, '0');
            });

            const accessories = State.armors.filter(a => a && a.etypeId === 6);
            const relics = State.armors.filter(a => a && a.etypeId === 7);
            const weaponsList = State.weapons.filter(w => w);
            const secondaryList = [
                ...State.weapons.filter(w => w && !w.note?.includes('2H Primary+Secondary')),
                ...State.armors.filter(a => a && a.etypeId === 2)
            ];
            const helms = State.armors.filter(a => a && a.etypeId === 3);
            const bodyArmors = State.armors.filter(a => a && a.etypeId === 4);
            const boots = State.armors.filter(a => a && a.etypeId === 5);

            actor.equips = actor.equips || [0, 0, 0, 0, 0, 0, 0];
            const simBaseLevel = State.actorSimBaseLevel || actor.initialLevel || 1;
            State.actorSimBaseLevel = simBaseLevel;

            const classTier = getTagVal(actorClass.note, 'Class Tier', '1');
            const customMax = parseInt(getTagVal(actorClass.note, 'Class Max Level'), 10);
            const tierCaps = { '1': 10, '2': 30, '3': 40, '4': 50, '5': 60, '6': 99 };
            const classMaxLvl = customMax || tierCaps[classTier] || 10;

            const simClassLevel = Math.min(classMaxLvl, State.actorSimClassLevel || 1);
            State.actorSimClassLevel = simClassLevel;

            container.innerHTML = `
                <!-- GENERAL SETTINGS & IDENTITY -->
                <div class="card">
                    <div class="card-header">
                        <h2 title="Pengaturan identitas dan profil karakter pahlawan">🎭 Actor: #${actor.id} ${escapeHtml(actor.name)}</h2>
                        <span style="font-size:0.85rem; color:var(--text-muted);">${escapeHtml(actor.nickname || '')}</span>
                    </div>
                    <div class="card-body">
                        <div class="grid-2">
                            <div>
                                <div class="grid-2">
                                    <div class="form-group">
                                        <label title="Nama karakter pahlawan yang tampil di layar, menu, dan dialog">Character Name</label>
                                        <input type="text" class="form-control" value="${escapeHtml(actor.name || '')}" onchange="actor.name=this.value; setUnsaved(true); renderSidebar(); updateActorSimulationLive();">
                                    </div>
                                    <div class="form-group">
                                        <label title="Julukan atau gelar kehormatan pahlawan">Nickname / Title</label>
                                        <input type="text" class="form-control" value="${escapeHtml(actor.nickname || '')}" onchange="actor.nickname=this.value; setUnsaved(true);">
                                    </div>
                                </div>

                                <div class="grid-3">
                                    <div class="form-group">
                                        <label title="Kelas pekerjaan awal yang menentukan pertumbuhan stat dan kemampuan">Starting Class</label>
                                        <select class="form-control" onchange="actor.classId=parseInt(this.value,10); setUnsaved(true); renderEditor();">
                                            ${State.classes.filter(c => c).map(c => `<option value="${c.id}" ${actor.classId === c.id ? 'selected' : ''}>#${c.id} ${escapeHtml(c.name)}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label title="Level awal karakter saat pertama kali bergabung ke pesta petualang">Initial Level</label>
                                        <input type="number" min="1" max="99" class="form-control" value="${actor.initialLevel || 1}" onchange="actor.initialLevel=parseInt(this.value,10); setUnsaved(true);">
                                    </div>
                                    <div class="form-group">
                                        <label title="Batas level tertinggi yang dapat dicapai karakter ini (maksimal 99)">Max Level</label>
                                        <input type="number" min="1" max="99" class="form-control" value="${actor.maxLevel || 99}" onchange="actor.maxLevel=parseInt(this.value,10); setUnsaved(true);">
                                    </div>
                                </div>

                                <div class="grid-2">
                                    <div class="form-group">
                                        <label title="Ras atau spesies karakter untuk interaksi afinitas cerita dan sifat khusus">Race (&lt;Race: ...&gt;)</label>
                                        <input type="text" class="form-control" placeholder="Contoh: Avesari, Human" value="${escapeHtml(race)}" onchange="setTagVal(actor, 'Race', this.value);">
                                    </div>
                                    <div class="form-group">
                                        <label title="Posisi baris tempur awal: 1 (Baris Depan / Melee), 2 (Tengah), 3 (Belakang / Support)">Default Row (&lt;Default Row: 1-3&gt;)</label>
                                        <select class="form-control" onchange="setTagVal(actor, 'Default Row', this.value);">
                                            <option value="1" ${defaultRow === '1' ? 'selected' : ''}>Baris Depan (Front Row)</option>
                                            <option value="2" ${defaultRow === '2' ? 'selected' : ''}>Baris Tengah (Middle Row)</option>
                                            <option value="3" ${defaultRow === '3' ? 'selected' : ''}>Baris Belakang (Back Row)</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="grid-2">
                                    <div class="form-group">
                                        <label title="ID status efek pasif bawaan unik yang selalu melekat pada karakter ini">Innate Passive State ID</label>
                                        <select class="form-control" onchange="setTagVal(actor, 'Passive State', this.value);">
                                            <option value="">(Tidak Ada)</option>
                                            ${State.states.filter(s => s).map(s => `<option value="${s.id}" ${passiveState === String(s.id) ? 'selected' : ''}>#${s.id} ${escapeHtml(s.name)}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="form-group" style="display:flex; align-items:center;">
                                        <label class="checkbox-label" style="margin-top:16px;">
                                            <input type="checkbox" ${isLocked ? 'checked' : ''} onchange="setBoolTag(actor, 'LockActor', this.checked);">
                                            <span title="Mencegah karakter ini dikeluarkan atau ditukar dari susunan party aktif">🔒 Lock in Party (&lt;LockActor&gt;)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label style="font-size:0.82rem; font-weight:600; display:block; margin-bottom:6px;" title="Pratinjau gambar potret besar karakter untuk menu status Nusvanir">Portrait Preview (&lt;Portrait: ...&gt;)</label>
                                <div class="portrait-preview-box">
                                    ${portrait ? `<img src="img/pictures/${portrait}.png" class="portrait-img" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'portrait-empty\\'>⚠️ File tidak ditemukan: img/pictures/${portrait}.png</div>';">` : `<div class="portrait-empty">No portrait selected.<br>Choose from the list below.</div>`}
                                </div>
                                <div class="form-group" style="margin-top:10px;">
                                    <label title="Pilih file ilustrasi potret karakter dari folder img/pictures/">Select Portrait Image (img/pictures/)</label>
                                    <select class="form-control" onchange="setTagVal(actor, 'Portrait', this.value); renderEditor();">
                                        <option value="">(Gunakan Face Graphic Standar)</option>
                                        ${State.pictures.map(p => {
                                            const base = p.replace(/\.(png|jpe?g)$/i, '');
                                            return `<option value="${base}" ${portrait === base ? 'selected' : ''}>${p}</option>`;
                                        }).join('')}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- 🎨 VISUAL GRAPHICS & SPRITES WITH LIVE PREVIEWS -->
                        <div style="margin-top:16px;">
                            <div style="font-size:0.85rem; font-weight:700; color:#38bdf8; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                                <span>🎨 RPG Maker MV Visual Graphics &amp; Sprites</span>
                                <span style="font-size:0.75rem; color:var(--text-muted);">Click any preview box to open visual sheet picker</span>
                            </div>
                            <div class="grid-3" style="gap:14px;">
                                <!-- 1. FACE GRAPHIC -->
                                <div class="graphic-preview-card">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                        <label style="margin:0; font-weight:700; font-size:0.82rem;" title="Grafis wajah untuk dialog teks percakapan dan menu sederhana">Face Graphic</label>
                                        <span class="badge-sub" id="faceIndexLabel">Index ${actor.faceIndex || 0}</span>
                                    </div>
                                    
                                    <div class="sprite-preview-box" id="facePreviewBox" title="Klik untuk membuka visual sheet picker" onclick="openGraphicSheetModal('face')">
                                        ${renderFacePreviewHtml(actor.faceName, actor.faceIndex || 0)}
                                    </div>

                                    <div class="form-group" style="margin-bottom:6px;">
                                        <select class="form-control" id="actorFaceSelect" onchange="onActorFaceChange(this.value)">
                                            <option value="">(None)</option>
                                            ${State.faces.map(f => {
                                                const clean = f.replace(/\.png$/i, '');
                                                return `<option value="${clean}" ${actor.faceName === clean ? 'selected' : ''}>${f}</option>`;
                                            }).join('')}
                                        </select>
                                    </div>

                                    <div style="font-size:0.7rem; color:var(--text-muted); margin-bottom:4px;" title="Pilih indeks wajah (0-7) dari 4 kolom x 2 baris sheet">Face Index (0 - 7):</div>
                                    <div class="index-grid-8" id="faceIndexGrid">
                                        ${[0, 1, 2, 3, 4, 5, 6, 7].map(idx => `
                                            <button type="button" class="idx-btn ${Number(actor.faceIndex || 0) === idx ? 'active' : ''}" 
                                                    onclick="onActorFaceIndexChange(${idx})" title="Wajah Indeks #${idx}">
                                                ${idx}
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>

                                <!-- 2. CHARACTER SPRITE -->
                                <div class="graphic-preview-card">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                        <label style="margin:0; font-weight:700; font-size:0.82rem;" title="Sprite visual karakter saat menjelajah peta dunia">Character Sprite</label>
                                        <span class="badge-sub" id="charIndexLabel">${(actor.characterName || '').startsWith('$') ? 'Single ($)' : `Index ${actor.characterIndex || 0}`}</span>
                                    </div>

                                    <div class="sprite-preview-box" id="charPreviewBox" title="Klik untuk membuka visual sheet picker" onclick="openGraphicSheetModal('character')">
                                        ${renderCharPreviewHtml(actor.characterName, actor.characterIndex || 0)}
                                    </div>

                                    <div class="form-group" style="margin-bottom:6px;">
                                        <select class="form-control" id="actorCharSelect" onchange="onActorCharChange(this.value)">
                                            <option value="">(None)</option>
                                            ${State.characters.map(c => {
                                                const clean = c.replace(/\.png$/i, '');
                                                return `<option value="${clean}" ${actor.characterName === clean ? 'selected' : ''}>${c}</option>`;
                                            }).join('')}
                                        </select>
                                    </div>

                                    <div style="font-size:0.7rem; color:var(--text-muted); margin-bottom:4px;" title="Pilih karakter (0-7) jika sheet berisi 8 karakter">Character Index (0 - 7):</div>
                                    <div class="index-grid-8" id="charIndexGrid">
                                        ${[0, 1, 2, 3, 4, 5, 6, 7].map(idx => `
                                            <button type="button" class="idx-btn ${Number(actor.characterIndex || 0) === idx ? 'active' : ''}" 
                                                    onclick="onActorCharIndexChange(${idx})" title="Karakter Indeks #${idx}" ${(actor.characterName || '').startsWith('$') ? 'disabled' : ''}>
                                                ${idx}
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>

                                <!-- 3. SV BATTLER -->
                                <div class="graphic-preview-card">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                        <label style="margin:0; font-weight:700; font-size:0.82rem;" title="Sprite animasi gerak samping saat melancarkan aksi tempur">[SV] Battler</label>
                                        <span class="badge-sub">Idle Pose</span>
                                    </div>

                                    <div class="sprite-preview-box" id="svPreviewBox" title="Pratinjau pose idle battler tempur">
                                        ${renderSvPreviewHtml(actor.battlerName)}
                                    </div>

                                    <div class="form-group" style="margin-bottom:6px;">
                                        <select class="form-control" id="actorSvSelect" onchange="onActorSvChange(this.value)">
                                            <option value="">(None)</option>
                                            ${State.svActors.map(s => {
                                                const clean = s.replace(/\.png$/i, '');
                                                return `<option value="${clean}" ${actor.battlerName === clean ? 'selected' : ''}>${s}</option>`;
                                            }).join('')}
                                        </select>
                                    </div>
                                    <div style="font-size:0.72rem; color:var(--text-muted); text-align:center; padding-top:6px;">
                                        Sideview Combat Sheet
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="form-group" style="margin-top:16px;">
                            <label title="Latar belakang kisah dan catatan narasi karakter yang tampil di menu profil">Character Lore &amp; Profile (&lt;Profile&gt;)</label>
                            <textarea class="form-control" rows="3" onchange="actor.profile=this.value; setBlockTag(actor, 'Profile', this.value);">${escapeHtml(profile)}</textarea>
                        </div>
                    </div>
                </div>

                <!-- BASE ACTOR STATS & INNATE GROWTH (SPECIES BASE) -->
                <div class="card">
                    <div class="card-header">
                        <h2 title="Stat dasar bawaan alami karakter (Species Base) dan pertumbuhannya per Base Level">📊 Actor Baseline Stats (Species Base)</h2>
                        <span style="font-size:0.8rem; color:var(--text-muted);">&lt;Base STR: X&gt; &amp; &lt;Actor Stat Growth&gt;</span>
                    </div>
                    <div class="card-body">
                        <div class="form-group" style="margin-bottom:14px;">
                            <label title="Pertumbuhan stat alami karakter setiap kali Base Level naik (+Stat per Base Level)">
                                📈 Innate Actor Growth per Base Level (&lt;Actor Stat Growth: +X STR, +Y INT, ...&gt;)
                            </label>
                            <input type="text" class="form-control" placeholder="Contoh: +1 STR, +1 VIT, +0.5 AGI" 
                                   value="${escapeHtml(getTagVal(note, 'Actor Stat Growth', ''))}" 
                                   oninput="setTagVal(actor, 'Actor Stat Growth', this.value); updateActorSimulationLive();"
                                   onchange="setTagVal(actor, 'Actor Stat Growth', this.value); updateActorSimulationLive();">
                        </div>
                        <div class="stat-grid-6">
                            ${CORE_ATTRIBUTES.map(attr => {
                                const rawClsIV = parseInt(getTagVal(actorClass.note || '', `Base ${attr.code}`, '5'), 10) || 5;
                                const ivInfo = getIVGradeInfo(rawClsIV);
                                return `
                                    <div class="stat-card-input">
                                        <label style="color:${attr.color};">
                                            <span>${attr.icon} ${attr.code}</span>
                                            <span style="font-size:0.75rem; color:var(--text-muted);">${attr.name}</span>
                                        </label>
                                        <input type="number" min="0" max="999" class="form-control" 
                                               id="actor-base-input-${attr.code}"
                                               value="${actorCoreStats[attr.code]}" 
                                               placeholder="10"
                                               oninput="onActorBaseStatInput('${attr.code}', this.value)"
                                               onchange="onActorBaseStatInput('${attr.code}', this.value)">
                                        <div style="font-size:0.7rem; color:var(--text-muted); margin-top:4px;" title="Scaling bakat dari profesi ${escapeHtml(actorClass.name)} (IV Rating: ${rawClsIV}/10)">
                                            Class IV: <strong style="color:${ivInfo.color};">${rawClsIV}/10 (${ivInfo.grade})</strong>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>

                <!-- INITIAL EQUIPS -->
                <div class="card">
                    <div class="card-header">
                        <h2 title="Perlengkapan bawaan awal karakter saat petualangan dimulai">🛡️ Initial Equipment (8 Nusvanir Slots)</h2>
                        <span style="font-size:0.8rem; color:var(--text-muted);" title="Perubahan perlengkapan langsung memperbarui simulasi stat di atas">Modifying equipment instantly updates the simulation above.</span>
                    </div>
                    <div class="card-body">
                        <div class="equip-grid">
                            <div class="equip-slot-item">
                                <div class="slot-title">⚔️ 1. Weapon (Utama)</div>
                                <select class="form-control" onchange="actor.equips[0]=parseInt(this.value,10); setUnsaved(true); updateActorSimulationLive();">
                                    <option value="0">(Kosong)</option>
                                    ${weaponsList.map(w => `<option value="${w.id}" ${actor.equips[0] === w.id ? 'selected' : ''}>#${w.id} ${escapeHtml(w.name)}</option>`).join('')}
                                </select>
                            </div>

                            <div class="equip-slot-item">
                                <div class="slot-title">🛡️ 2. Secondary (Off-Hand)</div>
                                <select class="form-control" onchange="actor.equips[1]=parseInt(this.value,10); setUnsaved(true); updateActorSimulationLive();">
                                    <option value="0">(Kosong)</option>
                                    ${secondaryList.map(s => `<option value="${s.id}" ${actor.equips[1] === s.id ? 'selected' : ''}>#${s.id} ${escapeHtml(s.name)}</option>`).join('')}
                                </select>
                            </div>

                            <div class="equip-slot-item">
                                <div class="slot-title">🎩 3. Helm (Kepala)</div>
                                <select class="form-control" onchange="actor.equips[2]=parseInt(this.value,10); setUnsaved(true); updateActorSimulationLive();">
                                    <option value="0">(Kosong)</option>
                                    ${helms.map(h => `<option value="${h.id}" ${actor.equips[2] === h.id ? 'selected' : ''}>#${h.id} ${escapeHtml(h.name)}</option>`).join('')}
                                </select>
                            </div>

                            <div class="equip-slot-item">
                                <div class="slot-title">🥋 4. Armor (Badan)</div>
                                <select class="form-control" onchange="actor.equips[3]=parseInt(this.value,10); setUnsaved(true); updateActorSimulationLive();">
                                    <option value="0">(Kosong)</option>
                                    ${bodyArmors.map(b => `<option value="${b.id}" ${actor.equips[3] === b.id ? 'selected' : ''}>#${b.id} ${escapeHtml(b.name)}</option>`).join('')}
                                </select>
                            </div>

                            <div class="equip-slot-item">
                                <div class="slot-title">👢 5. Boots (Kaki)</div>
                                <select class="form-control" onchange="actor.equips[4]=parseInt(this.value,10); setUnsaved(true); updateActorSimulationLive();">
                                    <option value="0">(Kosong)</option>
                                    ${boots.map(b => `<option value="${b.id}" ${actor.equips[4] === b.id ? 'selected' : ''}>#${b.id} ${escapeHtml(b.name)}</option>`).join('')}
                                </select>
                            </div>

                            <div class="equip-slot-item">
                                <div class="slot-title">💍 6. Accessory 1</div>
                                <select class="form-control" onchange="actor.equips[5]=parseInt(this.value,10); setUnsaved(true); updateActorSimulationLive();">
                                    <option value="0">(Kosong)</option>
                                    ${accessories.map(a => `<option value="${a.id}" ${actor.equips[5] === a.id ? 'selected' : ''}>#${a.id} ${escapeHtml(a.name)}</option>`).join('')}
                                </select>
                            </div>

                            <div class="equip-slot-item" style="border-color:var(--accent); background:rgba(59,130,246,0.1);">
                                <div class="slot-title" style="color:#60a5fa;">💍 6. Accessory 2 (&lt;Second Accessory&gt;)</div>
                                <select class="form-control" onchange="setTagVal(actor, 'Second Accessory', this.value); updateActorSimulationLive();">
                                    <option value="">(Kosong)</option>
                                    ${accessories.map(a => {
                                        const isSel = secAccVal === a.name || secAccVal === String(a.id);
                                        return `<option value="${escapeHtml(a.name)}" ${isSel ? 'selected' : ''}>#${a.id} ${escapeHtml(a.name)}</option>`;
                                    }).join('')}
                                </select>
                            </div>

                            <div class="equip-slot-item">
                                <div class="slot-title">🔮 7. Relic</div>
                                <select class="form-control" onchange="actor.equips[6]=parseInt(this.value,10); setUnsaved(true); updateActorSimulationLive();">
                                    <option value="0">(Kosong)</option>
                                    ${relics.map(r => `<option value="${r.id}" ${actor.equips[6] === r.id ? 'selected' : ''}>#${r.id} ${escapeHtml(r.name)}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- NOTETAG MENTAH -->
                <div class="card">
                    <div class="card-header"><h2 title="Editor teks langsung untuk seluruh notetag">📝 Raw Notetags (Direct Edit)</h2></div>
                    <div class="card-body">
                        <textarea id="rawNoteTextarea" class="form-control" rows="6" onchange="onRawNoteInput(this.value); updateActorSimulationLive();">${escapeHtml(actor.note || '')}</textarea>
                    </div>
                </div>
            `;
        }

        function renderActorStatPreview(container, actor) {
            const note = actor.note || '';
            const actorClass = State.classes[actor.classId] || { name: 'Unknown Class', note: '' };
            const simBaseLevel = State.actorSimBaseLevel || actor.initialLevel || 1;
            const simClassLevel = State.actorSimClassLevel || 1;
            const classTier = parseInt(getTagVal(actorClass.note || '', 'Class Tier', '1'), 10) || 1;
            const defaultMaxLvl = classTier === 1 ? 10 : (classTier === 2 ? 30 : (classTier === 3 ? 40 : (classTier === 4 ? 50 : (classTier === 5 ? 60 : 99))));
            const classMaxLvl = parseInt(getTagVal(actorClass.note || '', 'Class Max Level', '0'), 10) || defaultMaxLvl;

            container.innerHTML = `
                <!-- 1. DUAL LEVEL SLIDERS (BASE LEVEL & CLASS LEVEL) -->
                <div class="card" style="border: 1px solid rgba(59, 130, 246, 0.4); margin-bottom: 0;">
                    <div class="card-header" style="background: linear-gradient(90deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95)); padding: 8px 12px;">
                        <h2 style="font-size:0.85rem; margin:0; display:flex; align-items:center; gap:6px;">🎚️ Level Simulation</h2>
                        <div style="display:flex; gap:6px;">
                            <span class="badge-sub" style="font-size:0.75rem; font-weight:700; color:#38bdf8;" id="actorSimBaseBadge">Base Lv ${simBaseLevel}</span>
                            <span class="badge-sub" style="font-size:0.75rem; font-weight:700; color:#c084fc;" id="actorSimClassBadge">Class Lv ${simClassLevel} / ${classMaxLvl}</span>
                        </div>
                    </div>
                    <div class="card-body" style="padding: 10px 12px; display:flex; flex-direction:column; gap:10px;">
                        <!-- Base Level Slider -->
                        <div>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                <label style="font-weight:700; font-size:0.78rem; margin:0; color:#94a3b8;">👤 Base Level (1 - 99):</label>
                            </div>
                            <div style="display:flex; gap:8px; align-items:center;">
                                <input type="range" min="1" max="99" value="${simBaseLevel}" class="form-control" style="flex:1; cursor:pointer;" 
                                       id="actorSimBaseSlider" oninput="onActorSimBaseLevelChange(this.value)">
                                <input type="number" min="1" max="99" value="${simBaseLevel}" class="form-control" style="width:55px; text-align:center; padding:3px 4px; font-weight:700; font-size:0.85rem;" 
                                       id="actorSimBaseInput" onchange="onActorSimBaseLevelChange(this.value)">
                            </div>
                        </div>

                        <!-- Class Level Slider -->
                        <div>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                <label style="font-weight:700; font-size:0.78rem; margin:0; color:#94a3b8;">🛡️ Class Level (1 - ${classMaxLvl}):</label>
                                <span class="badge-sub" style="font-size:0.72rem; color:#a78bfa; padding:1px 6px;">${escapeHtml(actorClass.name)}</span>
                            </div>
                            <div style="display:flex; gap:8px; align-items:center;">
                                <input type="range" min="1" max="${classMaxLvl}" value="${simClassLevel}" class="form-control" style="flex:1; cursor:pointer;" 
                                       id="actorSimClassSlider" oninput="onActorSimClassLevelChange(this.value)">
                                <input type="number" min="1" max="${classMaxLvl}" value="${simClassLevel}" class="form-control" style="width:55px; text-align:center; padding:3px 4px; font-weight:700; font-size:0.85rem;" 
                                       id="actorSimClassInput" onchange="onActorSimClassLevelChange(this.value)">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 2. VITAL RESOURCES & 6 CORE STATS -->
                <div class="card" style="margin-bottom:0;">
                    <div class="card-header" style="padding:8px 12px;">
                        <h2 style="font-size:0.85rem; margin:0; color:#38bdf8;">📊 Vital Resources &amp; 6 Core Stats</h2>
                        <span style="font-size:0.7rem; color:var(--text-muted);">Actor + Class IV + Level + Eq</span>
                    </div>
                    <div class="card-body" style="padding:10px 12px; display:flex; flex-direction:column; gap:10px;">
                        <!-- Row Vitals: HP, MP, SP -->
                        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px;">
                            <div class="stat-card-input" style="border-left: 3px solid #f87171; padding:6px 8px; min-height:56px; justify-content:space-between;">
                                <div style="font-size:0.68rem; color:var(--text-muted); font-weight:600;">Max HP</div>
                                <div style="font-size:1.15rem; font-weight:700; color:#f87171; line-height:1.1;" id="sim-mhp">0</div>
                                <div style="font-size:0.6rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" id="sim-mhp-detail">Class+VIT+Eq</div>
                            </div>
                            <div class="stat-card-input" style="border-left: 3px solid #60a5fa; padding:6px 8px; min-height:56px; justify-content:space-between;">
                                <div style="font-size:0.68rem; color:var(--text-muted); font-weight:600;">Max MP</div>
                                <div style="font-size:1.15rem; font-weight:700; color:#60a5fa; line-height:1.1;" id="sim-mmp">0</div>
                                <div style="font-size:0.6rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" id="sim-mmp-detail">Class+INT+Eq</div>
                            </div>
                            <div class="stat-card-input" style="border-left: 3px solid #38bdf8; padding:6px 8px; min-height:56px; justify-content:space-between;">
                                <div style="font-size:0.68rem; color:var(--text-muted); font-weight:600;">Max SP</div>
                                <div style="font-size:1.15rem; font-weight:700; color:#38bdf8; line-height:1.1;" id="sim-msp">0</div>
                                <div style="font-size:0.6rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" id="sim-msp-detail">Base50+VIT+Eq</div>
                            </div>
                        </div>

                        <!-- 6 Core Attributes (2 columns: Physical & Special) -->
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                            ${CORE_ATTRIBUTES.map(a => `
                                <div class="stat-card-input" style="border-left: 3px solid ${a.color}; padding:6px 8px; min-height:52px; justify-content:space-between;">
                                    <div style="display:flex; justify-content:space-between; align-items:center;">
                                        <span style="color:${a.color}; font-weight:700; font-size:0.78rem;">${a.icon} ${a.code}</span>
                                        <span style="font-size:1.15rem; font-weight:700; color:${a.color}; line-height:1.1;" id="sim-core-${a.code}">0</span>
                                    </div>
                                    <div style="font-size:0.62rem; color:var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" id="sim-core-${a.code}-detail" title="">Base + ClsIV + Eq</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- 3. PARAMETER TEMPUR & MITIGASI -->
                <div class="card" style="margin-bottom:0;">
                    <div class="card-header" style="padding:8px 12px;">
                        <h2 style="font-size:0.85rem; margin:0; color:#fb923c;">⚔️ Combat Parameters &amp; Mitigation</h2>
                    </div>
                    <div class="card-body" style="padding:10px 12px; display:flex; flex-direction:column; gap:10px;">
                        <!-- Primary Combat Parameters (3 columns) -->
                        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px;">
                            <div class="stat-card-input" style="border-left: 2px solid #fb923c; padding:5px 6px; min-height:50px; justify-content:space-between;">
                                <div style="font-size:0.68rem; color:var(--text-muted);">⚔️ P.ATK</div>
                                <div style="font-size:1.05rem; font-weight:700; color:#fb923c; line-height:1.1;" id="sim-atk">0</div>
                                <div style="font-size:0.6rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" id="sim-atk-detail">STR/DEX+Eq</div>
                            </div>
                            <div class="stat-card-input" style="border-left: 2px solid #34d399; padding:5px 6px; min-height:50px; justify-content:space-between;">
                                <div style="font-size:0.68rem; color:var(--text-muted);">🛡️ P.DEF</div>
                                <div style="font-size:1.05rem; font-weight:700; color:#34d399; line-height:1.1;" id="sim-def">0</div>
                                <div style="font-size:0.6rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">VIT+Armor</div>
                            </div>
                            <div class="stat-card-input" style="border-left: 2px solid #a78bfa; padding:5px 6px; min-height:50px; justify-content:space-between;">
                                <div style="font-size:0.68rem; color:var(--text-muted);">🔮 M.ATK</div>
                                <div style="font-size:1.05rem; font-weight:700; color:#a78bfa; line-height:1.1;" id="sim-mat">0</div>
                                <div style="font-size:0.6rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">INT+Weap</div>
                            </div>
                            <div class="stat-card-input" style="border-left: 2px solid #38bdf8; padding:5px 6px; min-height:50px; justify-content:space-between;">
                                <div style="font-size:0.68rem; color:var(--text-muted);">🔰 M.MDF</div>
                                <div style="font-size:1.05rem; font-weight:700; color:#38bdf8; line-height:1.1;" id="sim-mdf">0</div>
                                <div style="font-size:0.6rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">INT/VIT+Eq</div>
                            </div>
                            <div class="stat-card-input" style="border-left: 2px solid #facc15; padding:5px 6px; min-height:50px; justify-content:space-between;">
                                <div style="font-size:0.68rem; color:var(--text-muted);">⚡ Speed</div>
                                <div style="font-size:1.05rem; font-weight:700; color:#facc15; line-height:1.1;" id="sim-spd">0</div>
                                <div style="font-size:0.6rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">AGI+Equip</div>
                            </div>
                            <div class="stat-card-input" style="border-left: 2px solid #4ade80; padding:5px 6px; min-height:50px; justify-content:space-between;">
                                <div style="font-size:0.68rem; color:var(--text-muted);">🍀 Luck</div>
                                <div style="font-size:1.05rem; font-weight:700; color:#4ade80; line-height:1.1;" id="sim-luk">0</div>
                                <div style="font-size:0.6rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">LUK+Equip</div>
                            </div>
                        </div>

                        <!-- Precision & Mitigation (4 columns chip badges) -->
                        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:4px; background:rgba(0,0,0,0.25); border:1px solid var(--border-color); border-radius:8px; padding:6px;">
                            <div style="padding:3px 4px; text-align:center;">
                                <div style="font-size:0.65rem; color:#facc15;">🎯 HIT</div>
                                <div style="font-size:0.85rem; font-weight:700; color:#facc15;" id="sim-hit">0%</div>
                            </div>
                            <div style="padding:3px 4px; text-align:center;">
                                <div style="font-size:0.65rem; color:#10b981;">💨 EVA</div>
                                <div style="font-size:0.85rem; font-weight:700; color:#10b981;" id="sim-eva">0%</div>
                            </div>
                            <div style="padding:3px 4px; text-align:center;">
                                <div style="font-size:0.65rem; color:#fb923c;">💥 CRI</div>
                                <div style="font-size:0.85rem; font-weight:700; color:#fb923c;" id="sim-cri">0%</div>
                            </div>
                            <div style="padding:3px 4px; text-align:center;">
                                <div style="font-size:0.65rem; color:#ef4444;">🗡️ CDMG</div>
                                <div style="font-size:0.85rem; font-weight:700; color:#ef4444;" id="sim-cdmg">150%</div>
                            </div>
                            <div style="padding:3px 4px; text-align:center;">
                                <div style="font-size:0.65rem; color:#4ade80;">🛡️ CEV</div>
                                <div style="font-size:0.85rem; font-weight:700; color:#4ade80;" id="sim-cev">0%</div>
                            </div>
                            <div style="padding:3px 4px; text-align:center;">
                                <div style="font-size:0.65rem; color:#60a5fa;">🛡️ GRD</div>
                                <div style="font-size:0.85rem; font-weight:700; color:#60a5fa;" id="sim-grd">100%</div>
                            </div>
                            <div style="padding:3px 4px; text-align:center;">
                                <div style="font-size:0.65rem; color:#34d399;">🔰 PDR</div>
                                <div style="font-size:0.85rem; font-weight:700; color:#34d399;" id="sim-pdr">0%</div>
                            </div>
                            <div style="padding:3px 4px; text-align:center;">
                                <div style="font-size:0.65rem; color:#38bdf8;">💠 MDR</div>
                                <div style="font-size:0.85rem; font-weight:700; color:#38bdf8;" id="sim-mdr">0%</div>
                            </div>
                            <div style="padding:3px 4px; text-align:center;">
                                <div style="font-size:0.65rem; color:#f87171;">❤️ HRG</div>
                                <div style="font-size:0.82rem; font-weight:700; color:#f87171;" id="sim-hrg">0%/T</div>
                            </div>
                            <div style="padding:3px 4px; text-align:center;">
                                <div style="font-size:0.65rem; color:#38bdf8;">🔋 TRG</div>
                                <div style="font-size:0.82rem; font-weight:700; color:#38bdf8;" id="sim-trg">3%/T</div>
                            </div>
                            <div style="padding:3px 4px; text-align:center;">
                                <div style="font-size:0.65rem; color:#f59e0b;">🏹 ArPen</div>
                                <div style="font-size:0.82rem; font-weight:700; color:#f59e0b;" id="sim-armpen">0%</div>
                            </div>
                            <div style="padding:3px 4px; text-align:center;">
                                <div style="font-size:0.65rem; color:#a78bfa;">🔮 MgPen</div>
                                <div style="font-size:0.82rem; font-weight:700; color:#a78bfa;" id="sim-magpen">0%</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 4. ACTIVE SETS & ELEMENTS -->
                <div class="card" style="margin-bottom:0;">
                    <div class="card-header" style="padding:8px 12px;"><h2 style="font-size:0.85rem; margin:0; color:#eab308;">✨ Active Sets &amp; Elements</h2></div>
                    <div class="card-body" style="padding:8px 12px;">
                        <div id="sim-extra-tags" style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
                            <span style="font-size:0.75rem; color:var(--text-muted);">(None)</span>
                        </div>
                    </div>
                </div>
            `;

            setTimeout(updateActorSimulationLive, 10);
        }

        // =====================================================================
        // 2. CLASSES EDITOR
        // =====================================================================
        function renderClassEditor(container, cls) {
            ensureClassParams(cls);
            const note = cls.note || '';

            const currentTier = getTagVal(note, 'Class Tier', '1');
            const currentMaxLvl = getTagVal(note, 'Class Max Level', '');
            const currentFrom = getTagVal(note, 'Class Change From', '0');
            const currentChangeLvl = getTagVal(note, 'Class Change Level', '');
            const currentChangeItem = getTagVal(note, 'Class Change Item', '');
            const currentChangeSwitch = getTagVal(note, 'Class Change Switch', '');
            const currentIcon = getTagVal(note, 'Class Icon', '0');
            const currentDesc = getBlockTag(note, 'Class Description', '');
            const currentGrowth = getTagVal(note, 'Class Stat Growth', '');

            const classTier = parseInt(currentTier, 10) || 1;
            const defaultMaxLvl = classTier === 1 ? 10 : (classTier === 2 ? 30 : (classTier === 3 ? 40 : (classTier === 4 ? 50 : (classTier === 5 ? 60 : 99))));
            const classMaxLvl = parseInt(currentMaxLvl, 10) || defaultMaxLvl;
            State.classTabSimLevel = Math.max(1, Math.min(State.classTabSimLevel || 1, classMaxLvl));
            const simClassLevel = State.classTabSimLevel;

            cls.expParams = cls.expParams || [30, 20, 30, 30];
            cls.learnings = cls.learnings || [];

            const coreStats = {};
            CORE_ATTRIBUTES.forEach(attr => {
                coreStats[attr.code] = getTagVal(note, `Base ${attr.code}`, '10');
            });

            const classFromOptions = [`<option value="0" ${currentFrom === '0' ? 'selected' : ''} title="Kelas dasar tanpa prasyarat kelas sebelumnya">(None - Base Class)</option>`];
            State.classes.forEach(c => {
                if (!c || c.id === cls.id) return;
                classFromOptions.push(`<option value="${c.id}" ${currentFrom === String(c.id) ? 'selected' : ''}>#${c.id} ${escapeHtml(c.name)}</option>`);
            });

            container.innerHTML = `
                <!-- CLASS PROFILE & SETTINGS -->
                <div class="card">
                    <div class="card-header">
                        <h2 title="Pengaturan spesifikasi kelas dan pertumbuhan stat">🛡️ Class: #${cls.id} ${escapeHtml(cls.name)}</h2>
                        <span style="font-size:0.85rem; color:var(--text-muted);">Tier ${currentTier}</span>
                    </div>
                    <div class="card-body">
                        <div class="grid-2">
                            <div>
                                <div class="form-group">
                                    <label title="Nama kelas atau profesi yang ditampilkan di game">Class Name</label>
                                    <input type="text" class="form-control" value="${escapeHtml(cls.name || '')}" onchange="cls.name=this.value; setUnsaved(true); renderSidebar();">
                                </div>
                                <div class="form-group">
                                    <label title="Tingkatan tier kelas dari Tier 1 (Novice) hingga Tier 6 (Mythic)">Class Progression Tier</label>
                                    <select class="form-control" onchange="setTagVal(cls, 'Class Tier', this.value); renderSidebar(); renderEditor();">
                                        <option value="1" ${currentTier === '1' ? 'selected' : ''} title="Kelas pemula / dasar tanpa prasyarat">Tier 1 - Novice</option>
                                        <option value="2" ${currentTier === '2' ? 'selected' : ''} title="Kelas tingkat lanjutan setelah menguasai Tier 1">Tier 2 - Apprentice</option>
                                        <option value="3" ${currentTier === '3' ? 'selected' : ''} title="Kelas spesialisasi cabang dengan kemampuan mendalam">Tier 3 - Adept</option>
                                        <option value="4" ${currentTier === '4' ? 'selected' : ''} title="Kelas tingkat master dengan penguasaan tinggi">Tier 4 - Master / Expert</option>
                                        <option value="5" ${currentTier === '5' ? 'selected' : ''} title="Kelas legendaris dengan jurus berkekuatan luar biasa">Tier 5 - Paragon</option>
                                        <option value="6" ${currentTier === '6' ? 'selected' : ''} title="Kelas puncak transenden / mitologis">Tier 6 - Mythic</option>
                                    </select>
                                </div>

                                <div class="form-group">
                                    <label title="ID kelas prasyarat yang harus dikuasai sebelum dapat berganti ke kelas ini">Prerequisite Class (&lt;Class Change From: ID&gt;)</label>
                                    <select class="form-control" onchange="setTagVal(cls, 'Class Change From', this.value !== '0' ? this.value : '');">
                                        ${classFromOptions.join('')}
                                    </select>
                                </div>

                                <div class="grid-3">
                                    <div class="form-group">
                                        <label title="Level minimal yang harus dicapai pada kelas sebelumnya sebelum promosi">Required Level for Promotion</label>
                                        <input type="number" class="form-control" placeholder="Lv" value="${currentChangeLvl}" onchange="setTagVal(cls, 'Class Change Level', this.value);">
                                    </div>
                                    <div class="form-group">
                                        <label title="Nama atau ID item promosi khusus yang dibutuhkan untuk membuka kelas ini">Required Promotion Item</label>
                                        <input type="number" class="form-control" placeholder="Item ID" value="${currentChangeItem}" onchange="setTagVal(cls, 'Class Change Item', this.value);">
                                    </div>
                                    <div class="form-group">
                                        <label title="ID sakelar cerita yang harus aktif agar kelas ini terbuka">Required Story Switch ID</label>
                                        <input type="number" class="form-control" placeholder="Switch" value="${currentChangeSwitch}" onchange="setTagVal(cls, 'Class Change Switch', this.value);">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label title="Batas maksimal level khusus untuk kelas ini jika berbeda dari normal">Custom Max Level (&lt;Class Max Level: X&gt;)</label>
                                    <input type="number" class="form-control" placeholder="Default sesuai Tier" value="${currentMaxLvl}" onchange="setTagVal(cls, 'Class Max Level', this.value);">
                                </div>
                            </div>

                            <div>
                                <div class="form-group">
                                    <label title="Indeks ikon visual kelas untuk menu tampilan antarmuka">Class Icon Index (&lt;Class Icon: ID&gt;)</label>
                                    <input type="number" class="form-control" value="${currentIcon}" onchange="setTagVal(cls, 'Class Icon', this.value);">
                                </div>

                                

                                <div class="form-group">
                                    <label title="Deskripsi kisah latar belakang dan gaya bertarung kelas ini">Class Lore &amp; Description (&lt;Class Description&gt;)</label>
                                    <textarea class="form-control" rows="4" onchange="setBlockTag(cls, 'Class Description', this.value);">${escapeHtml(currentDesc)}</textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- CLASS STAT APTITUDE (IV SCALING 1 - 10) -->
                <div class="card">
                    <div class="card-header">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <h2 title="Aptitude profesi berskala 1 - 10 (Sistem IV Pokémon)">⭐ Class Stat Aptitude / IV Rating (Skala 1 - 10)</h2>
                            <span class="badge" style="background:rgba(59,130,246,0.2); color:#60a5fa; font-size:0.75rem;">Pokemon IV Model</span>
                        </div>
                        <span style="font-size:0.8rem; color:var(--text-muted);">Menentukan stat awal Lv 1 &amp; scaling stat per Job Level</span>
                    </div>
                    <div class="card-body">
                        <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:14px; line-height:1.4;">
                            Setiap profesi memiliki kecenderungan stat bawaan (IV) berskala <strong>1 sampai 10</strong>. 
                            Nilai ini otomatis menentukan tambahan stat di Lv 1 (+IV) serta <em>growth rate</em> per level job (+IV ÷ 5 per Lv).
                        </p>
                        <div class="stat-grid-6">
                            ${CORE_ATTRIBUTES.map(attr => {
                                const rawVal = parseInt(coreStats[attr.code], 10) || 5;
                                const iv = Math.max(1, Math.min(10, rawVal));
                                const ivInfo = getIVGradeInfo(iv);
                                return `
                                    <div class="stat-card-input" style="border-left: 3px solid ${attr.color}; display:flex; flex-direction:column; justify-content:space-between; min-height:130px;">
                                        <div>
                                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                                <span style="color:${attr.color}; font-weight:700; font-size:0.85rem;">${attr.icon} ${attr.code}</span>
                                                <span class="badge" id="cls-iv-grade-${attr.code}" style="background:${ivInfo.color}; color:#fff; font-size:0.72rem; font-weight:700; padding:1px 6px; border-radius:4px;">
                                                    Grade ${ivInfo.grade}
                                                </span>
                                            </div>
                                            <div style="font-size:0.7rem; color:var(--text-muted); margin-bottom:6px;">${attr.name}</div>
                                        </div>
                                        <div>
                                            <div style="display:flex; gap:6px; align-items:center;">
                                                <input type="number" min="1" max="10" class="form-control" style="font-size:1.1rem; font-weight:700; text-align:center; padding:4px;" 
                                                       value="${iv}" oninput="onClassIVInput('${attr.code}', this.value)" onchange="onClassIVInput('${attr.code}', this.value)">
                                                <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">/ 10</span>
                                            </div>
                                            <div style="font-size:0.68rem; color:${ivInfo.color}; margin-top:4px; font-weight:600;" id="cls-iv-label-${attr.code}">
                                                +${ivInfo.rate.toFixed(1)}/Lv
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>

                        <div class="form-group" style="margin-top:16px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <label title="Override manual jika ingin pertumbuhan stat berbeda dari formula IV bawaan">
                                    ⚙️ Override Manual Stat Growth per Level (&lt;Class Stat Growth&gt;)
                                </label>
                                <span style="font-size:0.75rem; color:var(--text-muted);">(Opsional)</span>
                            </div>
                            <input type="text" class="form-control" placeholder="Biarkan kosong untuk auto-calculate dari IV (+IV/5 per level), atau isi misal: STR +1.5, VIT +1.0" 
                                   value="${escapeHtml(currentGrowth)}" 
                                   oninput="setTagVal(cls, 'Class Stat Growth', this.value); updateClassSimulationLive();" 
                                   onchange="setTagVal(cls, 'Class Stat Growth', this.value); updateClassSimulationLive();">
                            <div class="helper-text">Jika dikosongkan, editor otomatis menghitung pertumbuhan stat berdasarkan skala IV 1 - 10 di atas.</div>
                        </div>
                    </div>
                </div>

                <!-- DAFTAR SKILL YANG DIPELAJARI (LEARNINGS) -->
                <div class="card">
                    <div class="card-header">
                        <h2 title="Daftar kemampuan dan jurus yang dipelajari kelas ini berdasarkan level">📖 Class Skill Learnings</h2>
                        <button class="btn btn-secondary btn-sm" onclick="addClassLearning();" title="Tambah skill baru yang dipelajari pada level tertentu">➕ Add Skill Learning</button>
                    </div>
                    <div class="card-body">
                        <div style="overflow-x:auto;">
                            <table class="stat-table">
                                <thead>
                                    <tr>
                                        <th style="width:20%;">Level Belajar</th>
                                        <th style="width:50%;">Skill yang Didapat</th>
                                        <th style="width:20%;">Catatan / Notetag</th>
                                        <th style="width:10%; text-align:right;">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${cls.learnings.length === 0 ? `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:16px;">No skills learned yet. Click "+ Add Skill Learning" above.</td></tr>` : ''}
                                    ${cls.learnings.map((l, i) => `
                                        <tr>
                                            <td>
                                                <input type="number" min="1" max="99" class="form-control" style="padding:4px 8px; font-size:0.85rem;" value="${l.level || 1}" onchange="cls.learnings[${i}].level=parseInt(this.value,10); setUnsaved(true);">
                                            </td>
                                            <td>
                                                <select class="form-control" style="padding:4px 8px; font-size:0.85rem;" onchange="cls.learnings[${i}].skillId=parseInt(this.value,10); setUnsaved(true);">
                                                    ${State.skills.filter(s => s).map(s => `<option value="${s.id}" ${l.skillId === s.id ? 'selected' : ''}>#${s.id} ${escapeHtml(s.name)}</option>`).join('')}
                                                </select>
                                            </td>
                                            <td>
                                                <input type="text" class="form-control" style="padding:4px 8px; font-size:0.85rem;" value="${escapeHtml(l.note || '')}" onchange="cls.learnings[${i}].note=this.value; setUnsaved(true);">
                                            </td>
                                            <td style="text-align:right;">
                                                <button class="btn btn-danger btn-sm" onclick="removeClassLearning(${i});">🗑️</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- NOTETAG MENTAH -->
                <div class="card">
                    <div class="card-header"><h2 title="Editor teks langsung untuk seluruh notetag">📝 Raw Notetags (Direct Edit)</h2></div>
                    <div class="card-body">
                        <textarea id="rawNoteTextarea" class="form-control" rows="6" onchange="onRawNoteInput(this.value); updateClassSimulationLive();">${escapeHtml(cls.note || '')}</textarea>
                    </div>
                </div>
            `;

            setTimeout(updateClassSimulationLive, 10);
        }

        function addClassLearning() {
            const cls = State.classes[State.selectedIndex];
            cls.learnings = cls.learnings || [];
            cls.learnings.push({ level: 1, skillId: 1, note: '' });
            setUnsaved(true);
            renderEditor();
        }

        function removeClassLearning(index) {
            const cls = State.classes[State.selectedIndex];
            if (cls.learnings && cls.learnings[index]) {
                cls.learnings.splice(index, 1);
                setUnsaved(true);
                renderEditor();
            }
        }

        // =====================================================================
        // RIGHT COLUMN PREVIEW RENDERERS (HASIL STAT AKHIR & INSPECTORS)
        // =====================================================================

        function renderClassStatPreview(container, cls) {
            ensureClassParams(cls);
            const note = cls.note || '';
            const currentTier = parseInt(getTagVal(note, 'Class Tier', '1'), 10) || 1;
            const defaultMaxLvl = currentTier === 1 ? 10 : (currentTier === 2 ? 30 : (currentTier === 3 ? 40 : (currentTier === 4 ? 50 : (currentTier === 5 ? 60 : 99))));
            const classMaxLvl = parseInt(getTagVal(note, 'Class Max Level', ''), 10) || defaultMaxLvl;
            State.classTabSimLevel = Math.max(1, Math.min(State.classTabSimLevel || 1, classMaxLvl));
            const simLvl = State.classTabSimLevel;

            container.innerHTML = `
                <!-- 1. JOB LEVEL SIMULATOR -->
                <div class="card" style="margin-bottom:0;">
                    <div class="card-header" style="padding:10px 14px;">
                        <div>
                            <h2 style="font-size:0.85rem; margin:0;">🎯 Job Level Simulation</h2>
                            <div style="font-size:0.75rem; color:var(--text-muted);">Simulasi pertumbuhan profesi murni</div>
                        </div>
                        <span id="classSimLevelBadge" class="badge-sub" style="font-size:0.85rem; font-weight:700; color:#c084fc; background:rgba(192,132,252,0.15); border-color:rgba(192,132,252,0.3); padding:3px 10px;">
                            Job Lv ${simLvl} / ${classMaxLvl}
                        </span>
                    </div>
                    <div class="card-body" style="padding:10px 14px;">
                        <div style="display:flex; gap:10px; align-items:center;">
                            <input type="range" min="1" max="${classMaxLvl}" value="${simLvl}" class="form-control" style="flex:1; cursor:pointer;" 
                                   id="classSimSlider" oninput="onClassSimLevelChange(this.value)">
                            <input type="number" min="1" max="${classMaxLvl}" value="${simLvl}" class="form-control" style="width:65px; text-align:center; font-weight:700;" 
                                   id="classSimInput" onchange="onClassSimLevelChange(this.value)">
                        </div>
                    </div>
                </div>

                <!-- 2. TOTAL ATTRIBUTE BONUSES FROM THIS CLASS AT CURRENT JOB LEVEL -->
                <div class="card" style="margin-bottom:0;">
                    <div class="card-header" style="padding:8px 14px;">
                        <h2 style="font-size:0.85rem; margin:0; color:#38bdf8;">📊 Bonus Atribut Kelas (Lv ${simLvl})</h2>
                    </div>
                    <div class="card-body" style="padding:10px 14px;">
                        <div class="stat-grid-6">
                            ${CORE_ATTRIBUTES.map(attr => `
                                <div class="stat-card-input" style="border-left: 2px solid ${attr.color}; padding:6px 8px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center;">
                                        <span style="color:${attr.color}; font-weight:700; font-size:0.75rem;">${attr.icon} ${attr.code}</span>
                                        <span style="font-size:1.15rem; font-weight:700; color:${attr.color};" id="cls-sim-${attr.code}">0</span>
                                    </div>
                                    <div style="font-size:0.65rem; color:var(--text-muted);" id="cls-sim-${attr.code}-detail">IV + Growth</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- 3. RPG MAKER BASE CURVES PREVIEW -->
                <div class="card" style="margin-bottom:0;">
                    <div class="card-header" style="padding:8px 14px;">
                        <h2 style="font-size:0.85rem; margin:0; color:#10b981;">📈 Baseline Class Params (Lv ${simLvl})</h2>
                    </div>
                    <div class="card-body" style="padding:10px 14px;">
                        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px;">
                            <div class="stat-card-input" style="padding:6px 8px; border-left:2px solid #f87171;">
                                <div style="font-size:0.7rem; color:var(--text-muted);">Base MHP</div>
                                <div style="font-size:1.1rem; font-weight:700; color:#f87171;" id="cls-sim-mhp">0</div>
                            </div>
                            <div class="stat-card-input" style="padding:6px 8px; border-left:2px solid #60a5fa;">
                                <div style="font-size:0.7rem; color:var(--text-muted);">Base MMP</div>
                                <div style="font-size:1.1rem; font-weight:700; color:#60a5fa;" id="cls-sim-mmp">0</div>
                            </div>
                            <div class="stat-card-input" style="padding:6px 8px; border-left:2px solid #34d399;">
                                <div style="font-size:0.7rem; color:var(--text-muted);">Base DEF</div>
                                <div style="font-size:1.1rem; font-weight:700; color:#34d399;" id="cls-sim-def">0</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 4. SKILLS UNLOCKED AT OR BELOW THIS LEVEL -->
                <div class="card" style="margin-bottom:0;">
                    <div class="card-header" style="padding:8px 14px;">
                        <h2 style="font-size:0.85rem; margin:0; color:#eab308;">✨ Skills Unlocked (Job Lv 1 - ${simLvl})</h2>
                    </div>
                    <div class="card-body" style="padding:8px 14px; max-height:220px; overflow-y:auto;" id="cls-sim-skills-container">
                        <!-- Populated dynamically by updateClassSimulationLive -->
                    </div>
                </div>
            `;

            setTimeout(updateClassSimulationLive, 10);
        }

        function renderEquipmentStatPreview(container, item, type) {
            if (!item) return;
            const note = item.note || '';
            const rarity = getTagVal(note, 'NUSV Rarity', 'Common');
            const rarityColors = {
                'Common': '#94a3b8',
                'Uncommon': '#22c55e',
                'Rare': '#3b82f6',
                'Epic': '#a855f7',
                'Legendary': '#f59e0b',
                'Mythic': '#ef4444'
            };
            const rColor = rarityColors[rarity] || '#94a3b8';

            const coreBonuses = [];
            CORE_ATTRIBUTES.forEach(a => {
                const val = getTagVal(note, a.code, '');
                if (val) {
                    coreBonuses.push({ attr: a, val: val.startsWith('+') || val.startsWith('-') ? val : `+${val}` });
                }
            });

            const derivedBonuses = [];
            DERIVED_STAT_DEFS.forEach(d => {
                const val = getTagVal(note, d.key, '');
                if (val) {
                    derivedBonuses.push({ def: d, val: val.startsWith('+') || val.startsWith('-') ? val : `+${val}` });
                }
            });

            const pNames = ['MHP', 'MMP', 'ATK', 'DEF', 'MAT', 'MDF', 'AGI', 'LUK'];
            const paramBonuses = [];
            if (item.params) {
                item.params.forEach((p, idx) => {
                    if (p !== 0) paramBonuses.push({ name: pNames[idx], val: p > 0 ? `+${p}` : `${p}` });
                });
            }

            const sockets = parseInt(getTagVal(note, 'Sockets', '0'), 10) || 0;
            const unleash = getTagVal(note, 'Unleash Skill', '');
            const setName = getTagVal(note, 'Set', '');
            const desc = getTagVal(note, 'NUSV Desc', item.description || '');

            container.innerHTML = `
                <!-- EQUIPMENT INSPECTOR CARD -->
                <div class="card" style="border: 1px solid ${rColor}; box-shadow: 0 0 16px ${rColor}22; margin-bottom:0;">
                    <div class="card-header" style="background: linear-gradient(90deg, rgba(30, 41, 59, 0.95), ${rColor}15); padding:10px 14px;">
                        <div>
                            <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.5px; color:${rColor}; font-weight:700;">
                                ${escapeHtml(rarity)} ${type === 'weapon' ? 'Weapon' : 'Armor'}
                            </div>
                            <h2 style="font-size:1.1rem; margin:2px 0 0 0; color:#fff;">
                                #${item.id} ${escapeHtml(item.name || 'Unnamed')}
                            </h2>
                        </div>
                        <span class="badge" style="background:${rColor}22; color:${rColor}; border:1px solid ${rColor}66; font-size:0.75rem; font-weight:700; padding:3px 10px; border-radius:9999px;">
                            ${escapeHtml(rarity)}
                        </span>
                    </div>
                    <div class="card-body" style="padding:12px 14px; display:flex; flex-direction:column; gap:12px;">
                        <!-- EV Core Attribute Modifiers -->
                        <div>
                            <div style="font-size:0.75rem; font-weight:700; color:#38bdf8; margin-bottom:6px; display:flex; justify-content:space-between;">
                                <span>⭐ Core Attribute Bonuses (EV)</span>
                                <span style="font-size:0.68rem; color:var(--text-muted); font-weight:normal;">&lt;STR: +X&gt; etc.</span>
                            </div>
                            ${coreBonuses.length === 0 ? `<div style="font-size:0.75rem; color:var(--text-muted); font-style:italic;">Tidak ada bonus Core Attribute langsung</div>` : `
                                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px;">
                                    ${coreBonuses.map(b => `
                                        <div class="stat-card-input" style="border-left: 2px solid ${b.attr.color}; padding:4px 8px;">
                                            <span style="font-size:0.7rem; color:${b.attr.color}; font-weight:700;">${b.attr.icon} ${b.attr.code}</span>
                                            <div style="font-size:1.05rem; font-weight:700; color:#fff;">${escapeHtml(b.val)}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            `}
                        </div>

                        <!-- Combat Parameters -->
                        <div>
                            <div style="font-size:0.75rem; font-weight:700; color:#10b981; margin-bottom:6px;">
                                ⚔️ Primary Combat Parameters
                            </div>
                            ${paramBonuses.length === 0 ? `<div style="font-size:0.75rem; color:var(--text-muted); font-style:italic;">Tidak ada flat params (ATK/DEF/dll = 0)</div>` : `
                                <div style="display:flex; flex-wrap:wrap; gap:6px;">
                                    ${paramBonuses.map(p => `
                                        <div style="background:rgba(0,0,0,0.3); border:1px solid var(--border-color); border-radius:6px; padding:4px 10px; font-size:0.8rem;">
                                            <span style="color:var(--text-muted); font-size:0.72rem; margin-right:4px;">${p.name}:</span>
                                            <strong style="color:#f8fafc;">${p.val}</strong>
                                        </div>
                                    `).join('')}
                                </div>
                            `}
                        </div>

                        <!-- Derived Combat Stats -->
                        ${derivedBonuses.length > 0 ? `
                            <div>
                                <div style="font-size:0.75rem; font-weight:700; color:#fb923c; margin-bottom:6px;">
                                    ⚡ Derived &amp; Mitigation Stats
                                </div>
                                <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:6px;">
                                    ${derivedBonuses.map(d => `
                                        <div style="background:rgba(0,0,0,0.3); border:1px solid var(--border-color); border-radius:6px; padding:4px 8px; font-size:0.75rem; display:flex; justify-content:space-between;">
                                            <span style="color:var(--text-muted);">${d.def.name}:</span>
                                            <strong style="color:#fb923c;">${escapeHtml(d.val)}</strong>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}

                        <!-- Special Traits & Sockets -->
                        <div style="background:rgba(0,0,0,0.25); border:1px solid var(--border-color); border-radius:8px; padding:10px; font-size:0.78rem; display:flex; flex-direction:column; gap:6px;">
                            ${sockets > 0 ? `
                                <div style="display:flex; justify-content:space-between;">
                                    <span style="color:var(--text-muted);">💎 Gem Sockets:</span>
                                    <span style="font-weight:700; color:#38bdf8;">${'🔷 '.repeat(sockets)} (${sockets} Slot)</span>
                                </div>
                            ` : ''}
                            ${unleash ? `
                                <div style="display:flex; justify-content:space-between;">
                                    <span style="color:var(--text-muted);">⚡ Unleash Skill:</span>
                                    <span style="font-weight:700; color:#facc15;">${escapeHtml(unleash)}</span>
                                </div>
                            ` : ''}
                            ${setName ? `
                                <div style="display:flex; justify-content:space-between;">
                                    <span style="color:var(--text-muted);">✨ Item Set:</span>
                                    <span style="font-weight:700; color:#c084fc;">${escapeHtml(setName)}</span>
                                </div>
                            ` : ''}
                        </div>

                        <!-- Lore & Description -->
                        ${desc ? `
                            <div style="background:rgba(255,255,255,0.02); border-left:2px solid ${rColor}; padding:8px 10px; border-radius:0 6px 6px 0; font-size:0.78rem; color:#cbd5e1; font-style:italic; line-height:1.4;">
                                "${escapeHtml(desc)}"
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        function renderSkillStatPreview(container, skill) {
            if (!skill) return;
            const scopeNames = {
                0: 'None',
                1: '1 Enemy',
                2: 'All Enemies',
                3: '1 Random Enemy',
                4: '2 Random Enemies',
                5: '3 Random Enemies',
                6: '4 Random Enemies',
                7: '1 Ally (Alive)',
                8: 'All Allies (Alive)',
                9: '1 Ally (Dead)',
                10: 'All Allies (Dead)',
                11: 'The User'
            };
            const hitTypes = { 0: 'Certain Hit', 1: 'Physical Attack', 2: 'Magical Attack' };

            container.innerHTML = `
                <div class="card" style="margin-bottom:0;">
                    <div class="card-header" style="padding:10px 14px;">
                        <div>
                            <div style="font-size:0.75rem; color:#a78bfa; font-weight:700;">Skill Inspector</div>
                            <h2 style="font-size:1.1rem; margin:2px 0 0 0; color:#fff;">#${skill.id} ${escapeHtml(skill.name || 'Unnamed')}</h2>
                        </div>
                        <span class="badge" style="background:#a78bfa22; color:#a78bfa; border:1px solid #a78bfa55; font-size:0.75rem; font-weight:700; padding:3px 10px; border-radius:9999px;">
                            ${hitTypes[skill.hitType] || 'Action'}
                        </span>
                    </div>
                    <div class="card-body" style="padding:12px 14px; display:flex; flex-direction:column; gap:12px;">
                        <!-- Resource Costs -->
                        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px;">
                            <div class="stat-card-input" style="padding:6px 8px; border-left:2px solid #60a5fa;">
                                <div style="font-size:0.7rem; color:var(--text-muted);">MP Cost</div>
                                <div style="font-size:1.1rem; font-weight:700; color:#60a5fa;">${skill.mpCost || 0}</div>
                            </div>
                            <div class="stat-card-input" style="padding:6px 8px; border-left:2px solid #eab308;">
                                <div style="font-size:0.7rem; color:var(--text-muted);">TP Cost</div>
                                <div style="font-size:1.1rem; font-weight:700; color:#eab308;">${skill.tpCost || 0}</div>
                            </div>
                            <div class="stat-card-input" style="padding:6px 8px; border-left:2px solid #f87171;">
                                <div style="font-size:0.7rem; color:var(--text-muted);">TP Gain</div>
                                <div style="font-size:1.1rem; font-weight:700; color:#f87171;">+${skill.tpGain || 0}</div>
                            </div>
                        </div>

                        <!-- Target Scope & Speed -->
                        <div style="background:rgba(0,0,0,0.25); border:1px solid var(--border-color); border-radius:8px; padding:10px; font-size:0.78rem; display:flex; flex-direction:column; gap:6px;">
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:var(--text-muted);">🎯 Target Scope:</span>
                                <strong style="color:#f8fafc;">${scopeNames[skill.scope] || `Scope ${skill.scope}`}</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:var(--text-muted);">⚡ Speed (Priority):</span>
                                <strong style="color:#facc15;">${skill.speed > 0 ? `+${skill.speed}` : skill.speed}</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:var(--text-muted);">🎯 Success Rate:</span>
                                <strong style="color:#34d399;">${skill.successRate}%</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:var(--text-muted);">🔄 Repeats:</span>
                                <strong style="color:#38bdf8;">${skill.repeats}x</strong>
                            </div>
                        </div>

                        <!-- Damage Formula -->
                        ${skill.damage && skill.damage.type > 0 ? `
                            <div style="background:rgba(0,0,0,0.3); border:1px solid var(--border-color); border-radius:8px; padding:10px;">
                                <div style="font-size:0.72rem; color:#f87171; font-weight:700; margin-bottom:4px;">💥 Damage Formula</div>
                                <code style="font-size:0.8rem; color:#fca5a5; display:block; word-break:break-all;">
                                    ${escapeHtml(skill.damage.formula || '0')}
                                </code>
                                <div style="font-size:0.68rem; color:var(--text-muted); margin-top:4px;">
                                    Variance: ±${skill.damage.variance || 0}% ${skill.damage.critical ? '• Can Critical' : ''}
                                </div>
                            </div>
                        ` : ''}

                        <!-- Description -->
                        ${skill.description ? `
                            <div style="background:rgba(255,255,255,0.02); border-left:2px solid #a78bfa; padding:8px 10px; border-radius:0 6px 6px 0; font-size:0.78rem; color:#cbd5e1; font-style:italic;">
                                "${escapeHtml(skill.description)}"
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        function renderItemStatPreview(container, item) {
            if (!item) return;
            container.innerHTML = `
                <div class="card" style="margin-bottom:0;">
                    <div class="card-header" style="padding:10px 14px;">
                        <div>
                            <div style="font-size:0.75rem; color:#34d399; font-weight:700;">Item Inspector</div>
                            <h2 style="font-size:1.1rem; margin:2px 0 0 0; color:#fff;">#${item.id} ${escapeHtml(item.name || 'Unnamed')}</h2>
                        </div>
                        <span class="badge" style="background:#34d39922; color:#34d399; border:1px solid #34d39955; font-size:0.75rem; font-weight:700; padding:3px 10px; border-radius:9999px;">
                            ${item.consumable ? 'Consumable' : 'Key Item'}
                        </span>
                    </div>
                    <div class="card-body" style="padding:12px 14px; display:flex; flex-direction:column; gap:12px;">
                        <div style="background:rgba(0,0,0,0.25); border:1px solid var(--border-color); border-radius:8px; padding:10px; font-size:0.78rem; display:flex; flex-direction:column; gap:6px;">
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:var(--text-muted);">💰 Price:</span>
                                <strong style="color:#facc15;">${(item.price || 0).toLocaleString()} Gold</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:var(--text-muted);">🎯 Occasion:</span>
                                <strong style="color:#f8fafc;">${['Always', 'Battle Only', 'Menu Only', 'Never'][item.occasion] || 'Always'}</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:var(--text-muted);">🔄 Repeats:</span>
                                <strong style="color:#38bdf8;">${item.repeats}x</strong>
                            </div>
                        </div>

                        ${item.description ? `
                            <div style="background:rgba(255,255,255,0.02); border-left:2px solid #34d399; padding:8px 10px; border-radius:0 6px 6px 0; font-size:0.78rem; color:#cbd5e1; font-style:italic;">
                                "${escapeHtml(item.description)}"
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        function renderEnemyStatPreview(container, enemy) {
            if (!enemy) return;
            const p = enemy.params || [100, 10, 10, 10, 10, 10, 10, 10];
            container.innerHTML = `
                <div class="card" style="margin-bottom:0;">
                    <div class="card-header" style="padding:10px 14px;">
                        <div>
                            <div style="font-size:0.75rem; color:#ef4444; font-weight:700;">Enemy Combat Stats</div>
                            <h2 style="font-size:1.1rem; margin:2px 0 0 0; color:#fff;">#${enemy.id} ${escapeHtml(enemy.name || 'Unnamed')}</h2>
                        </div>
                    </div>
                    <div class="card-body" style="padding:12px 14px; display:flex; flex-direction:column; gap:12px;">
                        <!-- Primary Stats -->
                        <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:6px;">
                            <div class="stat-card-input" style="padding:6px 8px; border-left:2px solid #f87171;">
                                <div style="font-size:0.7rem; color:var(--text-muted);">Max HP</div>
                                <div style="font-size:1.1rem; font-weight:700; color:#f87171;">${p[0].toLocaleString()}</div>
                            </div>
                            <div class="stat-card-input" style="padding:6px 8px; border-left:2px solid #60a5fa;">
                                <div style="font-size:0.7rem; color:var(--text-muted);">Max MP</div>
                                <div style="font-size:1.1rem; font-weight:700; color:#60a5fa;">${p[1].toLocaleString()}</div>
                            </div>
                        </div>

                        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px;">
                            <div class="stat-card-input" style="padding:5px 6px; border-left:2px solid #fb923c;">
                                <div style="font-size:0.68rem; color:var(--text-muted);">ATK</div>
                                <div style="font-size:1rem; font-weight:700; color:#fb923c;">${p[2]}</div>
                            </div>
                            <div class="stat-card-input" style="padding:5px 6px; border-left:2px solid #34d399;">
                                <div style="font-size:0.68rem; color:var(--text-muted);">DEF</div>
                                <div style="font-size:1rem; font-weight:700; color:#34d399;">${p[3]}</div>
                            </div>
                            <div class="stat-card-input" style="padding:5px 6px; border-left:2px solid #a78bfa;">
                                <div style="font-size:0.68rem; color:var(--text-muted);">MAT</div>
                                <div style="font-size:1rem; font-weight:700; color:#a78bfa;">${p[4]}</div>
                            </div>
                            <div class="stat-card-input" style="padding:5px 6px; border-left:2px solid #38bdf8;">
                                <div style="font-size:0.68rem; color:var(--text-muted);">MDF</div>
                                <div style="font-size:1rem; font-weight:700; color:#38bdf8;">${p[5]}</div>
                            </div>
                            <div class="stat-card-input" style="padding:5px 6px; border-left:2px solid #facc15;">
                                <div style="font-size:0.68rem; color:var(--text-muted);">AGI</div>
                                <div style="font-size:1rem; font-weight:700; color:#facc15;">${p[6]}</div>
                            </div>
                            <div class="stat-card-input" style="padding:5px 6px; border-left:2px solid #4ade80;">
                                <div style="font-size:0.68rem; color:var(--text-muted);">LUK</div>
                                <div style="font-size:1rem; font-weight:700; color:#4ade80;">${p[7]}</div>
                            </div>
                        </div>

                        <!-- Rewards -->
                        <div style="background:rgba(0,0,0,0.25); border:1px solid var(--border-color); border-radius:8px; padding:10px; font-size:0.78rem; display:flex; justify-content:space-around;">
                            <div>
                                <span style="color:var(--text-muted);">EXP Reward:</span>
                                <strong style="color:#38bdf8; margin-left:4px;">${(enemy.exp || 0).toLocaleString()}</strong>
                            </div>
                            <div>
                                <span style="color:var(--text-muted);">Gold Drop:</span>
                                <strong style="color:#facc15; margin-left:4px;">${(enemy.gold || 0).toLocaleString()}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderStateStatPreview(container, state) {
            if (!state) return;
            container.innerHTML = `
                <div class="card" style="margin-bottom:0;">
                    <div class="card-header" style="padding:10px 14px;">
                        <div>
                            <div style="font-size:0.75rem; color:#ec4899; font-weight:700;">State / Status Effect</div>
                            <h2 style="font-size:1.1rem; margin:2px 0 0 0; color:#fff;">#${state.id} ${escapeHtml(state.name || 'Unnamed')}</h2>
                        </div>
                        <span class="badge" style="background:#ec489922; color:#ec4899; border:1px solid #ec489955; font-size:0.75rem; font-weight:700; padding:3px 10px; border-radius:9999px;">
                            Priority: ${state.priority || 0}
                        </span>
                    </div>
                    <div class="card-body" style="padding:12px 14px; display:flex; flex-direction:column; gap:12px;">
                        <div style="background:rgba(0,0,0,0.25); border:1px solid var(--border-color); border-radius:8px; padding:10px; font-size:0.78rem; display:flex; flex-direction:column; gap:6px;">
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:var(--text-muted);">⏱️ Duration:</span>
                                <strong style="color:#f8fafc;">${state.minTurns === state.maxTurns ? `${state.minTurns} Turns` : `${state.minTurns} - ${state.maxTurns} Turns`}</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:var(--text-muted);">💥 Remove by Damage:</span>
                                <strong style="color:#facc15;">${state.removeByDamage ? `${state.chanceByDamage}%` : 'No'}</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:var(--text-muted);">🚶 Remove by Walking:</span>
                                <strong style="color:#38bdf8;">${state.removeByWalking ? `${state.stepsToRemove} Steps` : 'No'}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // =====================================================================
        // 3. WEAPONS EDITOR (MERGED NUSV STAT SYSTEM)
        // =====================================================================
        function renderWeaponEditor(container, weapon) {
            ensureItemParams(weapon);
            const note = weapon.note || '';
            const is2H = note.includes('2H Primary+Secondary') || (weapon.traits && weapon.traits.some(t => t.code === 54 && t.dataId === 2));
            const isDual = note.includes('Dual-compatible Primary/Secondary');
            const handType = is2H ? '2H' : (isDual ? 'Dual' : '1H');

            const rarity = getTagVal(note, 'NUSV Rarity', 'Common');
            const acquisition = getTagVal(note, 'NUSV Acquisition', '');
            const region = getTagVal(note, 'NUSV Region', '');
            const desc = getTagVal(note, 'NUSV Desc', weapon.description || '');

            const sockets = getTagVal(note, 'Sockets', '');
            const upMax = getTagVal(note, 'Upgrade Max', '');
            const upRate = getTagVal(note, 'Upgrade Success', '');
            const upGold = getTagVal(note, 'Upgrade Gold', '');
            const upAtk = getTagVal(note, 'Upgrade ATK', '');
            const upMat = getTagVal(note, 'Upgrade MAT', '');
            const unleash = getTagVal(note, 'Unleash Skill', '');

            const coreBonuses = {};
            CORE_ATTRIBUTES.forEach(a => {
                coreBonuses[a.code] = getTagVal(note, a.code, '');
            });

            const derivedValues = {};
            DERIVED_STAT_DEFS.forEach(d => {
                derivedValues[d.key] = getTagVal(note, d.key, '');
            });

            const eleMatch = note.match(/<Element Amplify ([a-zA-Z]+):[ ]*(.+?)>/i);
            const eleName = eleMatch ? eleMatch[1] : '';
            const eleVal = eleMatch ? eleMatch[2] : '';

            const wtypes = State.system.weaponTypes || [];

            container.innerHTML = `
                <!-- WEAPON PROPERTIES & STATS -->
                <div class="card">
                    <div class="card-header">
                        <h2 title="Pengaturan spesifikasi dan daya serang senjata">⚔️ Weapon: #${weapon.id} ${escapeHtml(weapon.name)}</h2>
                        <span style="font-size:0.85rem; color:var(--text-muted);">Tipe: ${escapeHtml(wtypes[weapon.wtypeId] || `Tipe ${weapon.wtypeId}`)}</span>
                    </div>
                    <div class="card-body">
                        <div class="grid-2">
                            <div>
                                <div class="grid-2">
                                    <div class="form-group">
                                        <label title="Nama senjata yang ditampilkan di inventaris dan jendela status">Weapon Name</label>
                                        <input type="text" class="form-control" value="${escapeHtml(weapon.name || '')}" onchange="weapon.name=this.value; setUnsaved(true); renderSidebar();">
                                    </div>
                                    <div class="form-group">
                                        <label title="Indeks nomor visual ikon barang dari file IconSet.png">Icon Index</label>
                                        <input type="number" class="form-control" value="${weapon.iconIndex || 0}" onchange="weapon.iconIndex=parseInt(this.value,10); setUnsaved(true);">
                                    </div>
                                </div>

                                <div class="grid-3">
                                    <div class="form-group">
                                        <label title="Kategori senjata (misal Pedang, Busur, Tongkat Sihir, Belati)">Weapon Type</label>
                                        <select class="form-control" onchange="weapon.wtypeId=parseInt(this.value,10); setUnsaved(true);">
                                            ${wtypes.map((wt, idx) => idx === 0 ? '' : `<option value="${idx}" ${weapon.wtypeId === idx ? 'selected' : ''}>${escapeHtml(wt || `Tipe ${idx}`)}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label title="Harga beli di toko (harga jual default bernilai 50% dari harga beli)">Price (Gold)</label>
                                        <input type="number" min="0" class="form-control" value="${weapon.price || 0}" onchange="weapon.price=parseInt(this.value,10); setUnsaved(true);">
                                    </div>
                                    <div class="form-group">
                                        <label title="Animasi visual yang dimainkan saat karakter mengayunkan senjata biasa">Attack Animation</label>
                                        <select class="form-control" onchange="weapon.animationId=parseInt(this.value,10); setUnsaved(true);">
                                            <option value="0" title="Menggunakan animasi tebasan default bawaan">(Default Normal Attack)</option>
                                            ${State.animations.filter(a => a).map(a => `<option value="${a.id}" ${weapon.animationId === a.id ? 'selected' : ''}>#${a.id} ${escapeHtml(a.name)}</option>`).join('')}
                                        </select>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label title="Apakah senjata ini dipegang dengan satu tangan (1-Handed) atau dua tangan (2-Handed)">Hand Slot Rule</label>
                                    <select class="form-control" onchange="onWeaponHandChange(this.value)">
                                        <option value="1H" ${handType === '1H' ? 'selected' : ''}>1H Primary (Satu Tangan Normal)</option>
                                        <option value="2H" ${handType === '2H' ? 'selected' : ''}>2H Primary+Secondary (Dua Tangan / Kunci Off-Hand)</option>
                                        <option value="Dual" ${handType === 'Dual' ? 'selected' : ''} title="Dapat dipasang di slot senjata utama maupun slot kedua">Dual-compatible (Can Dual Wield)</option>
                                    </select>
                                </div>

                                <div class="grid-2">
                                    <div class="form-group">
                                        <label title="Tingkat kelangkaan barang (Common, Uncommon, Rare, Epic, Legendary, Mythic)">Item Rarity</label>
                                        <select class="form-control" onchange="setTagVal(weapon, 'NUSV Rarity', this.value); renderSidebar();">
                                            ${['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'].map(r => `<option value="${r}" ${rarity === r ? 'selected' : ''}>${r}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label title="Keterangan cara mendapatkan senjata (Drop, Crafting, Quest, Toko)">Acquisition Method</label>
                                        <input type="text" class="form-control" placeholder="Drop, Craft, Quest..." value="${escapeHtml(acquisition)}" onchange="setTagVal(weapon, 'NUSV Acquisition', this.value);">
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div class="form-group">
                                    <label title="Deskripsi tampilan senjata dalam game di menu perlengkapan">Game Description</label>
                                    <textarea class="form-control" rows="3" onchange="weapon.description=this.value; setTagVal(weapon, 'NUSV Desc', this.value);">${escapeHtml(weapon.description || desc)}</textarea>
                                </div>
                                <div class="form-group">
                                    <label title="Wilayah atau kerajaan tempat senjata ini dibuat">Origin Region (&lt;NUSV Region&gt;)</label>
                                    <input type="text" class="form-control" placeholder="Contoh: Nusvanir, Mandala..." value="${escapeHtml(region)}" onchange="setTagVal(weapon, 'NUSV Region', this.value);">
                                </div>
                                <div class="form-group">
                                    <label title="Jurus yang berpeluang keluar secara otomatis saat melakukan serangan biasa">Weapon Skill Unleash (&lt;Unleash Skill&gt;)</label>
                                    <input type="text" class="form-control" placeholder="Contoh: 15, 25%, 10" value="${escapeHtml(unleash)}" onchange="setTagVal(weapon, 'Unleash Skill', this.value);">
                                    <div class="helper-text" title="Peluang jurus ini aktif saat karakter melancarkan serangan biasa">Triggered automatically during normal basic attacks.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 📊 SISTEM STAT TERPADU NUSVANIR -->
                <div class="card">
                    <div class="card-header">
                        <h2>📊 Spesifikasi Stat &amp; Tempur Nusvanir</h2>
                        <span style="font-size:0.8rem; color:var(--text-muted);">Unified stat system (Power, 6 Core Attributes &amp; Derived Stats).</span>
                    </div>
                    <div class="card-body">
                        <!-- 1. WEAPON ATTACK POWER -->
                        <div style="font-size:0.82rem; font-weight:700; color:#fb923c; margin-bottom:8px;" title="Daya serang fisik dan sihir murni dari senjata">⚔️ Weapon Direct Power:</div>
                        <div class="grid-3" style="margin-bottom:16px;">
                            <div class="stat-card-input" style="border-left: 3px solid #fb923c;">
                                <label style="color:#fb923c;">
                                    <span>⚔️ Weapon ATK</span>
                                    <span style="font-size:0.75rem; color:var(--text-muted);" title="Daya serang fisik murni dari senjata (params[2])">Weapon Physical ATK</span>
                                </label>
                                <input type="number" class="form-control" value="${weapon.params[2] || 0}" onchange="weapon.params[2]=parseInt(this.value,10)||0; setUnsaved(true);">
                            </div>
                            <div class="stat-card-input" style="border-left: 3px solid #a78bfa;">
                                <label style="color:#a78bfa;">
                                    <span>🔮 Weapon MAT</span>
                                    <span style="font-size:0.75rem; color:var(--text-muted);" title="Daya serang magis murni dari senjata (params[4])">Weapon Magical ATK</span>
                                </label>
                                <input type="number" class="form-control" value="${weapon.params[4] || 0}" onchange="weapon.params[4]=parseInt(this.value,10)||0; setUnsaved(true);">
                            </div>
                            <div class="stat-card-input" style="border-left: 3px solid #facc15;">
                                <label style="color:#facc15;">
                                    <span>⚡ Action Speed (AGI)</span>
                                    <span style="font-size:0.75rem; color:var(--text-muted);" title="Bonus kecepatan inisiatif giliran saat mengayunkan senjata ini (params[6])">Attack Speed / Delay</span>
                                </label>
                                <input type="number" class="form-control" value="${weapon.params[6] || 0}" onchange="weapon.params[6]=parseInt(this.value,10)||0; setUnsaved(true);">
                            </div>
                        </div>

                        <!-- 2. ENAM ATRIBUT DASAR NUSVANIR -->
                        <div style="font-size:0.82rem; font-weight:700; color:#f59e0b; margin-bottom:8px;" title="Bonus atribut STR, INT, DEX, AGI, VIT, LUK dari perlengkapan ini">💪 6 Core Attributes Bonus:</div>
                        <div class="stat-grid-6" style="margin-bottom:16px;">
                            ${CORE_ATTRIBUTES.map(attr => `
                                <div class="stat-card-input">
                                    <label style="color:${attr.color};">
                                        <span>${attr.icon} ${attr.code}</span>
                                        <span style="font-size:0.75rem; color:var(--text-muted);">${attr.name}</span>
                                    </label>
                                    <input type="text" class="form-control" placeholder="+0" value="${coreBonuses[attr.code]}" onchange="setTagVal(weapon, '${attr.code}', this.value);">
                                </div>
                            `).join('')}
                        </div>

                        <!-- 3. STAT TURUNAN NUSVANIR -->
                        <div style="font-size:0.82rem; font-weight:700; color:#38bdf8; margin-bottom:6px;">💧 Vitalitas &amp; Regenerasi per Giliran:</div>
                        <div class="stat-grid-8" style="margin-bottom:16px;">
                            ${DERIVED_STAT_DEFS.filter(d => d.group === 'vital').map(d => `
                                <div class="stat-card-input">
                                    <label style="color:${d.color};">
                                        <span>${d.icon} ${d.name}</span>
                                    </label>
                                    <input type="text" class="form-control" placeholder="${d.placeholder}" value="${derivedValues[d.key]}" onchange="setTagVal(weapon, '${d.key}', this.value);">
                                </div>
                            `).join('')}
                        </div>

                        <div style="font-size:0.82rem; font-weight:700; color:#fb923c; margin-bottom:6px;" title="Bonus akurasi, kritikal, dan penetrasi armor musuh">🎯 Precision, Critical &amp; Penetration:</div>
                        <div class="stat-grid-8" style="margin-bottom:16px;">
                            ${DERIVED_STAT_DEFS.filter(d => d.group === 'offensive').map(d => `
                                <div class="stat-card-input">
                                    <label style="color:${d.color};">
                                        <span>${d.icon} ${d.name}</span>
                                    </label>
                                    <input type="text" class="form-control" placeholder="${d.placeholder}" value="${derivedValues[d.key]}" onchange="setTagVal(weapon, '${d.key}', this.value);">
                                </div>
                            `).join('')}
                        </div>

                        <div style="font-size:0.82rem; font-weight:700; color:#34d399; margin-bottom:6px;" title="Bonus mitigasi kerusakan dan penghindaran">🛡️ Defense, Evasion &amp; Mitigation:</div>
                        <div class="stat-grid-8" style="margin-bottom:16px;">
                            ${DERIVED_STAT_DEFS.filter(d => d.group === 'defensive').map(d => `
                                <div class="stat-card-input">
                                    <label style="color:${d.color};">
                                        <span>${d.icon} ${d.name}</span>
                                    </label>
                                    <input type="text" class="form-control" placeholder="${d.placeholder}" value="${derivedValues[d.key]}" onchange="setTagVal(weapon, '${d.key}', this.value);">
                                </div>
                            `).join('')}
                        </div>

                        <div style="font-size:0.82rem; font-weight:700; color:#a855f7; margin-bottom:6px;">✨ Utilitas &amp; Penguatan Elemen:</div>
                        <div class="grid-3">
                            ${DERIVED_STAT_DEFS.filter(d => d.group === 'utility').map(d => `
                                <div class="stat-card-input">
                                    <label style="color:${d.color};">
                                        <span>${d.icon} ${d.name}</span>
                                    </label>
                                    <input type="text" class="form-control" placeholder="${d.placeholder}" value="${derivedValues[d.key]}" onchange="setTagVal(weapon, '${d.key}', this.value);">
                                </div>
                            `).join('')}
                            <div class="stat-card-input">
                                <label style="color:#f59e0b;">
                                    <span>🔥 Amplifikasi Elemen</span>
                                </label>
                                <div style="display:flex; gap:6px;">
                                    <input type="text" class="form-control" placeholder="Elemen (Fire/Holy...)" value="${escapeHtml(eleName)}" id="wepEleName" onchange="onWeaponElementAmplifyChange()">
                                    <input type="text" class="form-control" placeholder="+15%" value="${escapeHtml(eleVal)}" id="wepEleVal" style="width:90px;" onchange="onWeaponElementAmplifyChange()">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SOKET & TEMPA -->
                <div class="card">
                    <div class="card-header"><h2 title="Pengaturan soket permata dan sistem penempaan pandai besi">💎 Gem Sockets &amp; Refining</h2></div>
                    <div class="card-body">
                        <div class="grid-2">
                            <div class="form-group">
                                <label>Jumlah Soket Permata (&lt;Sockets: X&gt;)</label>
                                <input type="number" min="0" max="8" class="form-control" placeholder="0" value="${sockets}" onchange="setTagVal(weapon, 'Sockets', this.value);">
                            </div>
                            <div class="form-group">
                                <label>Maksimal Tempa (+X)</label>
                                <input type="number" min="0" max="20" class="form-control" placeholder="10" value="${upMax}" onchange="setTagVal(weapon, 'Upgrade Max', this.value);">
                            </div>
                        </div>
                        <div class="grid-3">
                            <div class="form-group">
                                <label>% Sukses Tempa</label>
                                <input type="text" class="form-control" placeholder="90%" value="${upRate}" onchange="setTagVal(weapon, 'Upgrade Success', this.value);">
                            </div>
                            <div class="form-group">
                                <label title="Biaya emas yang dibutuhkan">Gold Cost</label>
                                <input type="number" class="form-control" placeholder="Gold" value="${upGold}" onchange="setTagVal(weapon, 'Upgrade Gold', this.value);">
                            </div>
                            <div class="form-group">
                                <label>Bonus ATK/Tempa</label>
                                <input type="text" class="form-control" placeholder="+3" value="${upAtk}" onchange="setTagVal(weapon, 'Upgrade ATK', this.value);">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- NOTETAG MENTAH -->
                <div class="card">
                    <div class="card-header"><h2 title="Editor teks langsung untuk seluruh notetag">📝 Raw Notetags (Direct Edit)</h2></div>
                    <div class="card-body">
                        <textarea id="rawNoteTextarea" class="form-control" rows="6" onchange="onRawNoteInput(this.value)">${escapeHtml(weapon.note || '')}</textarea>
                    </div>
                </div>
            `;
        }

        function onWeaponElementAmplifyChange() {
            const weapon = State.weapons[State.selectedIndex];
            let note = weapon.note || '';
            note = note.replace(/<Element Amplify [a-zA-Z]+:[ ]*.+?>\n?/gi, '').trim();
            const name = document.getElementById('wepEleName').value.trim();
            const val = document.getElementById('wepEleVal').value.trim();
            if (name && val) {
                note = `<Element Amplify ${name}: ${val}>\n` + note;
            }
            weapon.note = note.trim();
            setUnsaved(true);
            updateRawNoteTextarea();
        }

        function onWeaponHandChange(type) {
            const weapon = State.weapons[State.selectedIndex];
            weapon.traits = weapon.traits || [];

            setTagVal(weapon, 'NUSV Hand Slot', null);

            if (type === '2H') {
                setTagVal(weapon, 'NUSV Hand Slot', '2H Primary+Secondary');
                if (!weapon.traits.some(t => t.code === 54 && t.dataId === 2)) {
                    weapon.traits.push({ code: 54, dataId: 2, value: 1 });
                }
            } else if (type === 'Dual') {
                setTagVal(weapon, 'NUSV Hand Slot', 'Dual-compatible Primary/Secondary');
                weapon.traits = weapon.traits.filter(t => !(t.code === 54 && t.dataId === 2));
            } else {
                setTagVal(weapon, 'NUSV Hand Slot', '1H Primary');
                weapon.traits = weapon.traits.filter(t => !(t.code === 54 && t.dataId === 2));
            }
            renderEditor();
        }

        // =====================================================================
        // 4. ARMORS & ACCESSORIES EDITOR (MERGED NUSV STAT SYSTEM)
        // =====================================================================
        function renderArmorEditor(container, armor) {
            ensureItemParams(armor);
            const note = armor.note || '';
            const rarity = getTagVal(note, 'NUSV Rarity', 'Common');
            const customType = getTagVal(note, 'NUSV Armor Type', '');
            const region = getTagVal(note, 'NUSV Region', '');
            const desc = getTagVal(note, 'NUSV Desc', armor.description || '');

            const setName = getTagVal(note, 'NUSV Set Name', '');
            const set2 = getTagVal(note, 'NUSV Set Bonus 2', '');
            const set3 = getTagVal(note, 'NUSV Set Bonus 3', '');
            const set4 = getTagVal(note, 'NUSV Set Bonus 4', '');

            const sockets = getTagVal(note, 'Sockets', '');
            const upMax = getTagVal(note, 'Upgrade Max', '');
            const upSuccess = getTagVal(note, 'Upgrade Success', '');
            const upDef = getTagVal(note, 'Upgrade DEF', '');
            const upMdf = getTagVal(note, 'Upgrade MDF', '');

            const coreBonuses = {};
            CORE_ATTRIBUTES.forEach(a => {
                coreBonuses[a.code] = getTagVal(note, a.code, '');
            });

            const derivedValues = {};
            DERIVED_STAT_DEFS.forEach(d => {
                derivedValues[d.key] = getTagVal(note, d.key, '');
            });

            const eleMatch = note.match(/<Element Amplify ([a-zA-Z]+):[ ]*(.+?)>/i);
            const eleName = eleMatch ? eleMatch[1] : '';
            const eleVal = eleMatch ? eleMatch[2] : '';

            const atypes = State.system.armorTypes || [];
            const slotNames = {
                1: 'Weapon Slot (Khusus)',
                2: '🛡️ Shield / Secondary (Slot 2)',
                3: '🎩 Helm / Kepala (Slot 3)',
                4: '🥋 Armor / Baju (Slot 4)',
                5: '👢 Footwear / Boots (Slot 5)',
                6: '💍 Accessory (Slot 6)',
                7: '🔮 Relic (Slot 7)'
            };

            container.innerHTML = `
                <!-- IDENTITAS & TIPE PELINDUNG -->
                <div class="card">
                    <div class="card-header">
                        <h2 title="Pengaturan spesifikasi perlindungan dan aksesoris">${armor.etypeId === 6 ? '💍 Accessory' : (armor.etypeId === 7 ? '🔮 Relic' : '🛡️ Armor')}: #${armor.id} ${escapeHtml(armor.name)}</h2>
                        <span style="font-size:0.85rem; color:var(--text-muted);">${slotNames[armor.etypeId] || `Slot ${armor.etypeId}`}</span>
                    </div>
                    <div class="card-body">
                        <div class="grid-2">
                            <div>
                                <div class="grid-2">
                                    <div class="form-group">
                                        <label title="Nama pelindung atau aksesoris yang ditampilkan di inventaris">Armor Name</label>
                                        <input type="text" class="form-control" value="${escapeHtml(armor.name || '')}" onchange="armor.name=this.value; setUnsaved(true); renderSidebar();">
                                    </div>
                                    <div class="form-group">
                                        <label title="Indeks nomor visual ikon barang dari file IconSet.png">Icon Index</label>
                                        <input type="number" class="form-control" value="${armor.iconIndex || 0}" onchange="armor.iconIndex=parseInt(this.value,10); setUnsaved(true);">
                                    </div>
                                </div>

                                <div class="grid-3">
                                    <div class="form-group">
                                        <label title="Kategori slot perlengkapan: Perisai/Secondary, Helm, Baju Zirah, Sepatu, Aksesoris, atau Relik">Equipment Slot (etypeId)</label>
                                        <select class="form-control" onchange="armor.etypeId=parseInt(this.value,10); setUnsaved(true); renderSidebar(); renderEditor();">
                                            <option value="2" ${armor.etypeId === 2 ? 'selected' : ''}>2 - Secondary / Shield</option>
                                            <option value="3" ${armor.etypeId === 3 ? 'selected' : ''}>3 - Helm</option>
                                            <option value="4" ${armor.etypeId === 4 ? 'selected' : ''}>4 - Armor</option>
                                            <option value="5" ${armor.etypeId === 5 ? 'selected' : ''}>5 - Boots</option>
                                            <option value="6" ${armor.etypeId === 6 ? 'selected' : ''}>6 - Accessory</option>
                                            <option value="7" ${armor.etypeId === 7 ? 'selected' : ''}>7 - Relic</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label title="Tipe material pelindung (misal Zirah Berat, Ringan, Kain, Perisai)">Armor Type (atypeId)</label>
                                        <select class="form-control" onchange="armor.atypeId=parseInt(this.value,10); setUnsaved(true);">
                                            ${atypes.map((at, idx) => idx === 0 ? '' : `<option value="${idx}" ${armor.atypeId === idx ? 'selected' : ''}>${escapeHtml(at || `Tipe ${idx}`)}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label title="Harga beli di toko (harga jual default bernilai 50% dari harga beli)">Price (Gold)</label>
                                        <input type="number" min="0" class="form-control" value="${armor.price || 0}" onchange="armor.price=parseInt(this.value,10); setUnsaved(true);">
                                    </div>
                                </div>

                                <div class="grid-2">
                                    <div class="form-group">
                                        <label title="Tingkat kelangkaan barang (Common, Uncommon, Rare, Epic, Legendary, Mythic)">Item Rarity</label>
                                        <select class="form-control" onchange="setTagVal(armor, 'NUSV Rarity', this.value); renderSidebar();">
                                            ${['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'].map(r => `<option value="${r}" ${rarity === r ? 'selected' : ''}>${r}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label title="Sub-kategori bebas perlengkapan (misal Gauntlet, Cloak, Ring, Amulet)">Custom Sub-Type</label>
                                        <input type="text" class="form-control" placeholder="Shield, Ring, Talisman..." value="${escapeHtml(customType)}" onchange="setTagVal(armor, 'NUSV Armor Type', this.value);">
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div class="form-group">
                                    <label title="Deskripsi tampilan senjata dalam game di menu perlengkapan">Game Description</label>
                                    <textarea class="form-control" rows="3" onchange="armor.description=this.value; setTagVal(armor, 'NUSV Desc', this.value);">${escapeHtml(armor.description || desc)}</textarea>
                                </div>

                                <div class="grid-2">
                                    <div class="form-group">
                                        <label title="Nama set perlengkapan untuk mengaktifkan bonus set saat dipakai bersamaan">Set Name (&lt;NUSV Set Name&gt;)</label>
                                        <input type="text" class="form-control" placeholder="Mandala Guard Set" value="${escapeHtml(setName)}" onchange="setTagVal(armor, 'NUSV Set Name', this.value);">
                                    </div>
                                    <div class="form-group">
                                        <label title="Wilayah atau kerajaan asal perlengkapan">Origin Region</label>
                                        <input type="text" class="form-control" placeholder="Nusvanir, Mandala..." value="${escapeHtml(region)}" onchange="setTagVal(armor, 'NUSV Region', this.value);">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label title="Bonus atribut khusus yang aktif jika menggunakan beberapa perlengkapan dari set yang sama">Set Bonus Effects (2-Set / 3-Set / 4-Set)</label>
                                    <div class="grid-3">
                                        <input type="text" class="form-control" placeholder="2-Set..." value="${escapeHtml(set2)}" onchange="setTagVal(armor, 'NUSV Set Bonus 2', this.value);">
                                        <input type="text" class="form-control" placeholder="3-Set..." value="${escapeHtml(set3)}" onchange="setTagVal(armor, 'NUSV Set Bonus 3', this.value);">
                                        <input type="text" class="form-control" placeholder="4-Set..." value="${escapeHtml(set4)}" onchange="setTagVal(armor, 'NUSV Set Bonus 4', this.value);">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 📊 SISTEM STAT TERPADU NUSVANIR -->
                <div class="card">
                    <div class="card-header">
                        <h2>📊 Spesifikasi Stat &amp; Pertahanan Nusvanir</h2>
                        <span style="font-size:0.8rem; color:var(--text-muted);">Unified stat system (Protection, 6 Core Attributes &amp; Derived Stats).</span>
                    </div>
                    <div class="card-body">
                        <!-- 1. DAYA PERTAHANAN & VITAL LANGSUNG -->
                        <div style="font-size:0.82rem; font-weight:700; color:#34d399; margin-bottom:8px;">🛡️ Nilai Proteksi &amp; Kapasitas Vital:</div>
                        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap:10px; margin-bottom:16px;">
                            <div class="stat-card-input" style="border-left: 3px solid #34d399;">
                                <label style="color:#34d399;">
                                    <span>🛡️ Armor DEF</span>
                                    <span style="font-size:0.75rem; color:var(--text-muted);" title="Daya tahan fisik murni dari pelindung (params[3])">Armor Physical DEF</span>
                                </label>
                                <input type="number" class="form-control" value="${armor.params[3] || 0}" onchange="armor.params[3]=parseInt(this.value,10)||0; setUnsaved(true);">
                            </div>
                            <div class="stat-card-input" style="border-left: 3px solid #38bdf8;">
                                <label style="color:#38bdf8;">
                                    <span>🔰 Armor MDF</span>
                                    <span style="font-size:0.75rem; color:var(--text-muted);" title="Daya tahan sihir murni dari pelindung (params[5])">Armor Magical MDF</span>
                                </label>
                                <input type="number" class="form-control" value="${armor.params[5] || 0}" onchange="armor.params[5]=parseInt(this.value,10)||0; setUnsaved(true);">
                            </div>
                            <div class="stat-card-input" style="border-left: 3px solid #f87171;">
                                <label style="color:#f87171;">
                                    <span>❤️ Max HP</span>
                                    <span style="font-size:0.75rem; color:var(--text-muted);" title="Bonus kapasitas darah maksimal (params[0])">Max HP Bonus</span>
                                </label>
                                <input type="number" class="form-control" value="${armor.params[0] || 0}" onchange="armor.params[0]=parseInt(this.value,10)||0; setUnsaved(true);">
                            </div>
                            <div class="stat-card-input" style="border-left: 3px solid #60a5fa;">
                                <label style="color:#60a5fa;">
                                    <span>💧 Max MP</span>
                                    <span style="font-size:0.75rem; color:var(--text-muted);" title="Bonus kapasitas mana maksimal (params[1])">Max MP Bonus</span>
                                </label>
                                <input type="number" class="form-control" value="${armor.params[1] || 0}" onchange="armor.params[1]=parseInt(this.value,10)||0; setUnsaved(true);">
                            </div>
                            <div class="stat-card-input" style="border-left: 3px solid #facc15;">
                                <label style="color:#facc15;">
                                    <span>⚡ Action Speed</span>
                                    <span style="font-size:0.75rem; color:var(--text-muted);" title="Bonus kecepatan inisiatif giliran (params[6])">Movement Speed Bonus</span>
                                </label>
                                <input type="number" class="form-control" value="${armor.params[6] || 0}" onchange="armor.params[6]=parseInt(this.value,10)||0; setUnsaved(true);">
                            </div>
                            ${armor.etypeId === 2 ? `
                            <div class="stat-card-input" style="border-left: 3px solid #fb923c;">
                                <label style="color:#fb923c;">
                                    <span>⚔️ Shield ATK</span>
                                    <span style="font-size:0.75rem; color:var(--text-muted);" title="Daya serang saat menggunakan teknik hantaman perisai">Shield Bash ATK</span>
                                </label>
                                <input type="number" class="form-control" value="${armor.params[2] || 0}" onchange="armor.params[2]=parseInt(this.value,10)||0; setUnsaved(true);">
                            </div>` : ''}
                        </div>

                        <!-- 2. ENAM ATRIBUT DASAR NUSVANIR -->
                        <div style="font-size:0.82rem; font-weight:700; color:#f59e0b; margin-bottom:8px;" title="Bonus atribut STR, INT, DEX, AGI, VIT, LUK dari perlengkapan ini">💪 6 Core Attributes Bonus:</div>
                        <div class="stat-grid-6" style="margin-bottom:16px;">
                            ${CORE_ATTRIBUTES.map(attr => `
                                <div class="stat-card-input">
                                    <label style="color:${attr.color};">
                                        <span>${attr.icon} ${attr.code}</span>
                                        <span style="font-size:0.75rem; color:var(--text-muted);">${attr.name}</span>
                                    </label>
                                    <input type="text" class="form-control" placeholder="+0" value="${coreBonuses[attr.code]}" onchange="setTagVal(armor, '${attr.code}', this.value);">
                                </div>
                            `).join('')}
                        </div>

                        <!-- 3. STAT TURUNAN NUSVANIR -->
                        <div style="font-size:0.82rem; font-weight:700; color:#38bdf8; margin-bottom:6px;">💧 Vitalitas &amp; Regenerasi per Giliran:</div>
                        <div class="stat-grid-8" style="margin-bottom:16px;">
                            ${DERIVED_STAT_DEFS.filter(d => d.group === 'vital').map(d => `
                                <div class="stat-card-input">
                                    <label style="color:${d.color};">
                                        <span>${d.icon} ${d.name}</span>
                                    </label>
                                    <input type="text" class="form-control" placeholder="${d.placeholder}" value="${derivedValues[d.key]}" onchange="setTagVal(armor, '${d.key}', this.value);">
                                </div>
                            `).join('')}
                        </div>

                        <div style="font-size:0.82rem; font-weight:700; color:#34d399; margin-bottom:6px;" title="Bonus mitigasi kerusakan, penghindaran, dan tangkisan">🛡️ Defense, Evasion &amp; Mitigation:</div>
                        <div class="stat-grid-8" style="margin-bottom:16px;">
                            ${DERIVED_STAT_DEFS.filter(d => d.group === 'defensive').map(d => `
                                <div class="stat-card-input">
                                    <label style="color:${d.color};">
                                        <span>${d.icon} ${d.name}</span>
                                    </label>
                                    <input type="text" class="form-control" placeholder="${d.placeholder}" value="${derivedValues[d.key]}" onchange="setTagVal(armor, '${d.key}', this.value);">
                                </div>
                            `).join('')}
                        </div>

                        <div style="font-size:0.82rem; font-weight:700; color:#fb923c; margin-bottom:6px;" title="Bonus akurasi, kritikal, dan penetrasi armor musuh">🎯 Precision, Critical &amp; Penetration:</div>
                        <div class="stat-grid-8" style="margin-bottom:16px;">
                            ${DERIVED_STAT_DEFS.filter(d => d.group === 'offensive').map(d => `
                                <div class="stat-card-input">
                                    <label style="color:${d.color};">
                                        <span>${d.icon} ${d.name}</span>
                                    </label>
                                    <input type="text" class="form-control" placeholder="${d.placeholder}" value="${derivedValues[d.key]}" onchange="setTagVal(armor, '${d.key}', this.value);">
                                </div>
                            `).join('')}
                        </div>

                        <div style="font-size:0.82rem; font-weight:700; color:#a855f7; margin-bottom:6px;">✨ Utilitas &amp; Penguatan Elemen:</div>
                        <div class="grid-3">
                            ${DERIVED_STAT_DEFS.filter(d => d.group === 'utility').map(d => `
                                <div class="stat-card-input">
                                    <label style="color:${d.color};">
                                        <span>${d.icon} ${d.name}</span>
                                    </label>
                                    <input type="text" class="form-control" placeholder="${d.placeholder}" value="${derivedValues[d.key]}" onchange="setTagVal(armor, '${d.key}', this.value);">
                                </div>
                            `).join('')}
                            <div class="stat-card-input">
                                <label style="color:#f59e0b;">
                                    <span>🔥 Amplifikasi Elemen</span>
                                </label>
                                <div style="display:flex; gap:6px;">
                                    <input type="text" class="form-control" placeholder="Elemen (Fire/Holy...)" value="${escapeHtml(eleName)}" id="armEleName" onchange="onArmorElementAmplifyChange()">
                                    <input type="text" class="form-control" placeholder="+15%" value="${escapeHtml(eleVal)}" id="armEleVal" style="width:90px;" onchange="onArmorElementAmplifyChange()">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SOKET & TEMPA -->
                <div class="card">
                    <div class="card-header"><h2 title="Pengaturan soket permata dan sistem penempaan pandai besi">💎 Gem Sockets &amp; Refining</h2></div>
                    <div class="card-body">
                        <div class="grid-2">
                            <div class="form-group">
                                <label>Jumlah Soket Permata (&lt;Sockets: X&gt;)</label>
                                <input type="number" min="0" max="8" class="form-control" placeholder="0" value="${sockets}" onchange="setTagVal(armor, 'Sockets', this.value);">
                            </div>
                            <div class="form-group">
                                <label>Maksimal Tempa (+X)</label>
                                <input type="number" min="0" max="20" class="form-control" placeholder="10" value="${upMax}" onchange="setTagVal(armor, 'Upgrade Max', this.value);">
                            </div>
                        </div>
                        <div class="grid-3">
                            <div class="form-group">
                                <label>% Sukses Tempa</label>
                                <input type="text" class="form-control" placeholder="90%" value="${upSuccess}" onchange="setTagVal(armor, 'Upgrade Success', this.value);">
                            </div>
                            <div class="form-group">
                                <label>Bonus DEF/Tempa</label>
                                <input type="text" class="form-control" placeholder="+2" value="${upDef}" onchange="setTagVal(armor, 'Upgrade DEF', this.value);">
                            </div>
                            <div class="form-group">
                                <label>Bonus MDF/Tempa</label>
                                <input type="text" class="form-control" placeholder="+2" value="${upMdf}" onchange="setTagVal(armor, 'Upgrade MDF', this.value);">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- NOTETAG MENTAH -->
                <div class="card">
                    <div class="card-header"><h2 title="Editor teks langsung untuk seluruh notetag">📝 Raw Notetags (Direct Edit)</h2></div>
                    <div class="card-body">
                        <textarea id="rawNoteTextarea" class="form-control" rows="6" onchange="onRawNoteInput(this.value)">${escapeHtml(armor.note || '')}</textarea>
                    </div>
                </div>
            `;
        }

        function onArmorElementAmplifyChange() {
            const armor = State.armors[State.selectedIndex];
            let note = armor.note || '';
            note = note.replace(/<Element Amplify [a-zA-Z]+:[ ]*.+?>\n?/gi, '').trim();
            const name = document.getElementById('armEleName').value.trim();
            const val = document.getElementById('armEleVal').value.trim();
            if (name && val) {
                note = `<Element Amplify ${name}: ${val}>\n` + note;
            }
            armor.note = note.trim();
            setUnsaved(true);
            updateRawNoteTextarea();
        }

        // =====================================================================
        // 5. SKILLS EDITOR
        // =====================================================================
        function renderSkillEditor(container, skill) {
            const note = skill.note || '';
            const isInstant = hasTag(note, 'Instant Cast');
            const instantVal = getTagVal(note, 'Instant Cast', isInstant ? 'Free' : 'None');
            const targetTag = getTagVal(note, 'Target', '');
            const wordWrap = hasTag(note, 'WordWrap');
            const desc = getTagVal(note, 'NUSV Desc', skill.description || '');

            const learnLvl = getTagVal(note, 'Learn Level', '');
            const learnJp = getTagVal(note, 'Learn JP', '');
            const learnGold = getTagVal(note, 'Learn Gold', '');
            const learnClass = getTagVal(note, 'Learn Class', '');
            const learnItem = getTagVal(note, 'Learn Item', '');
            const learnSwitch = getTagVal(note, 'Learn Switch', '');
            const hideIfLearned = hasTag(note, 'Hide If Learned');
            const jpGain = getTagVal(note, 'JP Gain', '');

            const critDmg = getTagVal(note, 'Critical Damage', '');
            const armPen = getTagVal(note, 'Armor Penetration', '');
            const magPen = getTagVal(note, 'Magic Penetration', '');
            const dmgCap = getTagVal(note, 'Damage Cap', '');
            const bypassCap = hasTag(note, 'Bypass Damage Cap');

            skill.damage = skill.damage || { type: 0, elementId: 0, formula: '0', variance: 20, critical: false };
            skill.effects = skill.effects || [];

            const stypes = State.system.skillTypes || [];
            const elements = State.system.elements || [];

            container.innerHTML = `
                <!-- IDENTITAS & PENGGUNAAN SKILL -->
                <div class="card">
                    <div class="card-header">
                        <h2 title="Pengaturan jurus, mantra sihir, dan formula kalkulasi damage">✨ Skill: #${skill.id} ${escapeHtml(skill.name)}</h2>
                        <span style="font-size:0.85rem; color:var(--text-muted);">${escapeHtml(stypes[skill.stypeId] || `Tipe ${skill.stypeId}`)}</span>
                    </div>
                    <div class="card-body">
                        <div class="grid-2">
                            <div>
                                <div class="grid-2">
                                    <div class="form-group">
                                        <label title="Nama skill, jurus, atau mantra yang tampil di menu tempur">Skill Name</label>
                                        <input type="text" class="form-control" value="${escapeHtml(skill.name || '')}" onchange="skill.name=this.value; setUnsaved(true); renderSidebar();">
                                    </div>
                                    <div class="form-group">
                                        <label title="Indeks nomor visual ikon barang dari file IconSet.png">Icon Index</label>
                                        <input type="number" class="form-control" value="${skill.iconIndex || 0}" onchange="skill.iconIndex=parseInt(this.value,10); setUnsaved(true);">
                                    </div>
                                </div>

                                <div class="grid-3">
                                    <div class="form-group">
                                        <label title="Kategori tipe skill (misal Magic, Special, Martial Arts)">Skill Type (stypeId)</label>
                                        <select class="form-control" onchange="skill.stypeId=parseInt(this.value,10); setUnsaved(true);">
                                            ${stypes.map((st, idx) => idx === 0 ? '' : `<option value="${idx}" ${skill.stypeId === idx ? 'selected' : ''}>${escapeHtml(st || `Tipe ${idx}`)}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label title="Jumlah Mana Points (MP) yang dibutuhkan untuk menggunakan skill">MP Cost</label>
                                        <input type="number" min="0" class="form-control" value="${skill.mpCost || 0}" onchange="skill.mpCost=parseInt(this.value,10); setUnsaved(true);">
                                    </div>
                                    <div class="form-group">
                                        <label title="Jumlah Stamina Points (SP) atau TP yang dibutuhkan untuk menggunakan skill">SP / TP Cost</label>
                                        <input type="number" min="0" class="form-control" value="${skill.tpCost || 0}" onchange="skill.tpCost=parseInt(this.value,10); setUnsaved(true);">
                                    </div>
                                </div>

                                <div class="grid-2">
                                    <div class="form-group">
                                        <label title="Target penerima efek skill (1 Musuh, Semua Musuh, 1 Kawan, Semua Kawan, dll.)">Scope / Target</label>
                                        <select class="form-control" onchange="skill.scope=parseInt(this.value,10); setUnsaved(true);">
                                            ${Object.keys(SCOPE_NAMES).map(k => `<option value="${k}" ${skill.scope === parseInt(k,10) ? 'selected' : ''}>${SCOPE_NAMES[k]}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label title="Kondisi di mana skill ini bisa digunakan (Selalu, Hanya Pertempuran, Hanya di Menu)">Occasion</label>
                                        <select class="form-control" onchange="skill.occasion=parseInt(this.value,10); setUnsaved(true);">
                                            ${Object.keys(OCCASION_NAMES).map(k => `<option value="${k}" ${skill.occasion === parseInt(k,10) ? 'selected' : ''}>${OCCASION_NAMES[k]}</option>`).join('')}
                                        </select>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label title="Animasi visual yang dimainkan pada target saat skill dilancarkan">Skill Animation</label>
                                    <select class="form-control" onchange="skill.animationId=parseInt(this.value,10); setUnsaved(true);">
                                        <option value="0">(Tanpa Animasi)</option>
                                        ${State.animations.filter(a => a).map(a => `<option value="${a.id}" ${skill.animationId === a.id ? 'selected' : ''}>#${a.id} ${escapeHtml(a.name)}</option>`).join('')}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <div class="form-group">
                                    <label title="Deskripsi tampilan senjata dalam game di menu perlengkapan">Game Description</label>
                                    <textarea class="form-control" rows="3" onchange="skill.description=this.value; setTagVal(skill, 'NUSV Desc', this.value);">${escapeHtml(skill.description || desc)}</textarea>
                                </div>

                                <div class="grid-2">
                                    <div class="form-group">
                                        <label title="Skill langsung dieksekusi seketika tanpa menghabiskan giliran tempur">Instant Cast (&lt;Instant Cast&gt;)</label>
                                        <select class="form-control" onchange="onSkillInstantChange(this.value)">
                                            <option value="None" ${(!isInstant && instantVal === 'None') ? 'selected' : ''} title="Mengkonsumsi giliran normal seperti biasa">Normal (Consumes Turn)</option>
                                            <option value="Free" ${(isInstant && (instantVal === 'Free' || instantVal === '')) ? 'selected' : ''}>Free Action (Tanpa Turn)</option>
                                            <option value="Turn" ${instantVal === 'Turn' ? 'selected' : ''}>Turn Khusus</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label title="Pembatasan target berdasarkan baris formasi (Baris Depan, Baris Belakang)">Target Row Formation (&lt;Target&gt;)</label>
                                        <select class="form-control" onchange="setTagVal(skill, 'Target', this.value !== 'Default' ? this.value : '');">
                                            <option value="Default" ${targetTag === '' ? 'selected' : ''}>Default Scope</option>
                                            <option value="Ally Row" ${targetTag === 'Ally Row' ? 'selected' : ''}>Baris Teman</option>
                                            <option value="Enemy Row" ${targetTag === 'Enemy Row' ? 'selected' : ''} title="Menarget seluruh musuh pada satu baris">Enemy Row</option>
                                            <option value="Front Enemy Row" ${targetTag === 'Front Enemy Row' ? 'selected' : ''} title="Menarget musuh di baris depan">Front Enemy Row</option>
                                            <option value="Back Enemy Row" ${targetTag === 'Back Enemy Row' ? 'selected' : ''} title="Menarget musuh di baris belakang">Back Enemy Row</option>
                                            <option value="Everybody" ${targetTag === 'Everybody' ? 'selected' : ''}>Semua Battler</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="grid-3">
                                    <div class="form-group">
                                        <label title="Pengubah kecepatan inisiatif giliran saat merapal skill ini (nilai positif = lebih cepat)">Speed Modifier</label>
                                        <input type="number" class="form-control" value="${skill.speed || 0}" onchange="skill.speed=parseInt(this.value,10); setUnsaved(true);">
                                    </div>
                                    <div class="form-group">
                                        <label title="Persentase peluang keberhasilan aktivasi skill (default 100%)">Success Rate (%)</label>
                                        <input type="number" min="0" max="100" class="form-control" value="${skill.successRate !== undefined ? skill.successRate : 100}" onchange="skill.successRate=parseInt(this.value,10); setUnsaved(true);">
                                    </div>
                                    <div class="form-group">
                                        <label title="Jumlah pukulan berturut-turut yang dilancarkan dalam satu kali aksi">Repeats Count</label>
                                        <input type="number" min="1" max="10" class="form-control" value="${skill.repeats || 1}" onchange="skill.repeats=parseInt(this.value,10); setUnsaved(true);">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- FORMULA KERUSAKAN / PEMULIHAN (DAMAGE FORMULA) -->
                <div class="card">
                    <div class="card-header">
                        <h2 title="Pengaturan formula perhitungan kerusakan, elemen serangan, dan variasi">💥 Damage Formula &amp; Elements</h2>
                    </div>
                    <div class="card-body">
                        <div class="grid-4">
                            <div class="form-group">
                                <label title="Jenis efek kerusakan: Kerusakan HP, Kerusakan MP, Pemulihan HP, Serap HP, dll.">Damage Type</label>
                                <select class="form-control" onchange="skill.damage.type=parseInt(this.value,10); setUnsaved(true);">
                                    ${Object.keys(DAMAGE_TYPES).map(k => `<option value="${k}" ${skill.damage.type === parseInt(k,10) ? 'selected' : ''}>${DAMAGE_TYPES[k]}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label title="Elemen damage yang dihasilkan (Fisik, Api, Es, Petir, Cahaya, Kegelapan, dll.)">Damage Element</label>
                                <select class="form-control" onchange="skill.damage.elementId=parseInt(this.value,10); setUnsaved(true);">
                                    <option value="-1" ${skill.damage.elementId === -1 ? 'selected' : ''} title="Mengikuti elemen senjata yang sedang digunakan">Normal Weapon Element</option>
                                    <option value="0" ${skill.damage.elementId === 0 ? 'selected' : ''}>Tanpa Elemen (None)</option>
                                    ${elements.map((el, idx) => idx === 0 ? '' : `<option value="${idx}" ${skill.damage.elementId === idx ? 'selected' : ''}>${escapeHtml(el)}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label title="Persentase fluktuasi acak hasil akhir damage (misal 20% berarti damage +/- 20%)">Damage Variance (%)</label>
                                <input type="number" min="0" max="100" class="form-control" value="${skill.damage.variance || 20}" onchange="skill.damage.variance=parseInt(this.value,10); setUnsaved(true);">
                            </div>
                            <div class="form-group" style="display:flex; align-items:center;">
                                <label class="checkbox-label" style="margin-top:16px;">
                                    <input type="checkbox" ${skill.damage.critical ? 'checked' : ''} onchange="skill.damage.critical=this.checked; setUnsaved(true);">
                                    <span title="Apakah serangan skill ini dapat menghasilkan pukulan kritikal">Allow Critical Hits</span>
                                </label>
                            </div>
                        </div>

                        <div class="form-group" style="margin-top:10px;">
                            <label title="Rumus formula perhitungan damage (a = penyerang, b = target, misal: a.atk * 4 - b.def * 2)">Damage Formula (e.g. <code>a.atk * 4 - b.def * 2</code>)</label>
                            <input type="text" class="form-control" style="font-family:monospace; font-size:0.9rem; color:#60a5fa;" value="${escapeHtml(skill.damage.formula || '0')}" onchange="skill.damage.formula=this.value; setUnsaved(true);">
                        </div>
                    </div>
                </div>

                <!-- SKILL LEARNING & MODIFIERS -->
                <div class="grid-2">
                    <div class="card">
                        <div class="card-header"><h2 title="Syarat yang dibutuhkan untuk mempelajari skill ini">📚 Skill Learning Requirements</h2></div>
                        <div class="card-body">
                            <div class="grid-3">
                                <div class="form-group">
                                    <label title="Batas level paling rendah yang mungkin dimiliki musuh ini">Minimum Level Floor</label>
                                    <input type="number" class="form-control" placeholder="Level" value="${learnLvl}" onchange="setTagVal(skill, 'Learn Level', this.value);">
                                </div>
                                <div class="form-group">
                                    <label title="Jumlah Job Points (JP) yang dibutuhkan untuk mempelajari skill ini">JP Cost</label>
                                    <input type="number" class="form-control" placeholder="JP" value="${learnJp}" onchange="setTagVal(skill, 'Learn JP', this.value);">
                                </div>
                                <div class="form-group">
                                    <label title="Biaya emas yang dibutuhkan">Gold Cost</label>
                                    <input type="number" class="form-control" placeholder="Gold" value="${learnGold}" onchange="setTagVal(skill, 'Learn Gold', this.value);">
                                </div>
                            </div>
                            <div class="grid-2">
                                <div class="form-group">
                                    <label title="Kelas tertentu yang disyaratkan untuk mempelajari skill ini">Prerequisite Class</label>
                                    <select class="form-control" onchange="setTagVal(skill, 'Learn Class', this.value);">
                                        <option value="" title="Dapat dipelajari oleh kelas apa pun">(Any Class)</option>
                                        ${State.classes.filter(c => c).map(c => `<option value="${c.id}" ${learnClass === String(c.id) ? 'selected' : ''}>#${c.id} ${escapeHtml(c.name)}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label title="Jumlah JP yang didapatkan saat skill ini digunakan dalam pertempuran">JP Gain on Use (&lt;JP Gain&gt;)</label>
                                    <input type="text" class="form-control" placeholder="+10" value="${jpGain}" onchange="setTagVal(skill, 'JP Gain', this.value);">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header"><h2 title="Pengaturan batas kerusakan maksimal dan pengabaian pertahanan">💥 Penetration &amp; Damage Cap</h2></div>
                        <div class="card-body">
                            <div class="grid-3">
                                <div class="form-group">
                                    <label>Bonus Crit Dmg</label>
                                    <input type="text" class="form-control" placeholder="+25%" value="${critDmg}" onchange="setTagVal(skill, 'Critical Damage', this.value);">
                                </div>
                                <div class="form-group">
                                    <label title="Modifikasi pengabaian persen pertahanan fisik target (<Armor Penetration: +X%>)">Armor Penetration Modifier</label>
                                    <input type="text" class="form-control" placeholder="20%" value="${armPen}" onchange="setTagVal(skill, 'Armor Penetration', this.value);">
                                </div>
                                <div class="form-group">
                                    <label title="Modifikasi pengabaian persen pertahanan sihir target (<Magic Penetration: +X%>)">Magic Penetration Modifier</label>
                                    <input type="text" class="form-control" placeholder="20%" value="${magPen}" onchange="setTagVal(skill, 'Magic Penetration', this.value);">
                                </div>
                            </div>
                            <div class="grid-2">
                                <div class="form-group">
                                    <label>Batas Cap Damage</label>
                                    <input type="number" class="form-control" placeholder="99999" value="${dmgCap}" onchange="setTagVal(skill, 'Damage Cap', this.value);">
                                </div>
                                <div class="form-group" style="display:flex; align-items:center;">
                                    <label class="checkbox-label" style="margin-top:16px;">
                                        <input type="checkbox" ${bypassCap ? 'checked' : ''} onchange="setBoolTag(skill, 'Bypass Damage Cap', this.checked);">
                                        <span>Tembus Batas (&lt;Bypass Cap&gt;)</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- NOTETAG MENTAH -->
                <div class="card">
                    <div class="card-header"><h2 title="Editor teks langsung untuk seluruh notetag">📝 Raw Notetags (Direct Edit)</h2></div>
                    <div class="card-body">
                        <textarea id="rawNoteTextarea" class="form-control" rows="6" onchange="onRawNoteInput(this.value)">${escapeHtml(skill.note || '')}</textarea>
                    </div>
                </div>
            `;
        }

        function onSkillInstantChange(val) {
            const skill = State.skills[State.selectedIndex];
            setBoolTag(skill, 'Instant Cast', false);
            setTagVal(skill, 'Instant Cast', null);
            if (val === 'Free') {
                setBoolTag(skill, 'Instant Cast', true);
            } else if (val === 'Turn') {
                setTagVal(skill, 'Instant Cast', 'Turn');
            }
        }

        // =====================================================================
        // 6. ITEMS EDITOR
        // =====================================================================
        function renderItemEditor(container, item) {
            const note = item.note || '';
            const rarity = getTagVal(note, 'NUSV Rarity', 'Common');
            const menuCat = getTagVal(note, 'Menu Category', '') || getTagVal(note, 'NUSV Category', '');
            const subCat = getTagVal(note, 'NUSV Subcategory', '');
            const region = getTagVal(note, 'NUSV Region', '');
            const source = getTagVal(note, 'NUSV Source', '');
            const desc = getTagVal(note, 'NUSV Desc', item.description || '');

            const isSocket = hasTag(note, 'Socket Item');
            const socketWeapOnly = hasTag(note, 'Socket Weapon Only');
            const socketArmOnly = hasTag(note, 'Socket Armor Only');
            let socketTarget = 'Any';
            if (socketWeapOnly) socketTarget = 'Weapon';
            else if (socketArmOnly) socketTarget = 'Armor';

            const sockAtk = getTagVal(note, 'Socket ATK', '');
            const sockDef = getTagVal(note, 'Socket DEF', '');
            const sockMat = getTagVal(note, 'Socket MAT', '');
            const sockMdf = getTagVal(note, 'Socket MDF', '');
            const sockMhp = getTagVal(note, 'Socket MHP', '');
            const sockMmp = getTagVal(note, 'Socket MMP', '');

            const synCat = getTagVal(note, 'Synthesis Category', '');
            const synAmt = getTagVal(note, 'Synthesis Amount', '');

            container.innerHTML = `
                <!-- IDENTITAS & PROPERTI ITEM -->
                <div class="card">
                    <div class="card-header">
                        <h2 title="Pengaturan barang konsumsi, permata soket, dan item kunci">🧪 Item: #${item.id} ${escapeHtml(item.name)}</h2>
                        <span style="font-size:0.85rem; color:var(--text-muted);">${item.consumable ? 'Consumable' : 'Reusable'} • Harga: ${item.price} G</span>
                    </div>
                    <div class="card-body">
                        <div class="grid-2">
                            <div>
                                <div class="grid-2">
                                    <div class="form-group">
                                        <label title="Nama barang atau ramuan yang ditampilkan di inventaris">Item Name</label>
                                        <input type="text" class="form-control" value="${escapeHtml(item.name || '')}" onchange="item.name=this.value; setUnsaved(true); renderSidebar();">
                                    </div>
                                    <div class="form-group">
                                        <label title="Indeks nomor visual ikon barang dari file IconSet.png">Icon Index</label>
                                        <input type="number" class="form-control" value="${item.iconIndex || 0}" onchange="item.iconIndex=parseInt(this.value,10); setUnsaved(true);">
                                    </div>
                                </div>

                                <div class="grid-3">
                                    <div class="form-group">
                                        <label title="Kategori barang: Regular Item, Key Item (Barang Kunci), Hidden Item A, Hidden Item B">Item Type (itypeId)</label>
                                        <select class="form-control" onchange="item.itypeId=parseInt(this.value,10); setUnsaved(true);">
                                            <option value="1" ${item.itypeId === 1 ? 'selected' : ''}>1 - Item Regular</option>
                                            <option value="2" ${item.itypeId === 2 ? 'selected' : ''}>2 - Key Item (Kunci/Penting)</option>
                                            <option value="3" ${item.itypeId === 3 ? 'selected' : ''}>3 - Hidden A</option>
                                            <option value="4" ${item.itypeId === 4 ? 'selected' : ''}>4 - Hidden B</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label title="Harga beli di toko (harga jual default bernilai 50% dari harga beli)">Price (Gold)</label>
                                        <input type="number" min="0" class="form-control" value="${item.price || 0}" onchange="item.price=parseInt(this.value,10); setUnsaved(true);">
                                    </div>
                                    <div class="form-group">
                                        <label title="Apakah barang akan berkurang atau langsung habis setelah digunakan satu kali">Consumable</label>
                                        <select class="form-control" onchange="item.consumable=(this.value==='1'); setUnsaved(true);">
                                            <option value="1" ${item.consumable ? 'selected' : ''}>Ya (Consumable)</option>
                                            <option value="0" ${!item.consumable ? 'selected' : ''}>Tidak (Reusable)</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="grid-2">
                                    <div class="form-group">
                                        <label title="Target penerima efek skill (1 Musuh, Semua Musuh, 1 Kawan, Semua Kawan, dll.)">Scope / Target</label>
                                        <select class="form-control" onchange="item.scope=parseInt(this.value,10); setUnsaved(true);">
                                            ${Object.keys(SCOPE_NAMES).map(k => `<option value="${k}" ${item.scope === parseInt(k,10) ? 'selected' : ''}>${SCOPE_NAMES[k]}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label title="Kapan barang ini dapat digunakan (Selalu, Hanya Pertempuran, Hanya di Menu)">Occasion</label>
                                        <select class="form-control" onchange="item.occasion=parseInt(this.value,10); setUnsaved(true);">
                                            ${Object.keys(OCCASION_NAMES).map(k => `<option value="${k}" ${item.occasion === parseInt(k,10) ? 'selected' : ''}>${OCCASION_NAMES[k]}</option>`).join('')}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div class="form-group">
                                    <label title="Deskripsi tampilan senjata dalam game di menu perlengkapan">Game Description</label>
                                    <textarea class="form-control" rows="3" onchange="item.description=this.value; setTagVal(item, 'NUSV Desc', this.value);">${escapeHtml(item.description || desc)}</textarea>
                                </div>

                                <div class="grid-2">
                                    <div class="form-group">
                                        <label title="Tingkat kelangkaan barang (Common, Uncommon, Rare, Epic, Legendary, Mythic)">Item Rarity</label>
                                        <select class="form-control" onchange="setTagVal(item, 'NUSV Rarity', this.value); renderSidebar();">
                                            ${['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'].map(r => `<option value="${r}" ${rarity === r ? 'selected' : ''}>${r}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Kategori Menu (&lt;Menu Category&gt;)</label>
                                        <input type="text" class="form-control" placeholder="Material, Consumable, Key..." value="${escapeHtml(menuCat)}" onchange="setTagVal(item, 'Menu Category', this.value); setTagVal(item, 'NUSV Category', this.value);">
                                    </div>
                                </div>

                                <div class="grid-3">
                                    <div class="form-group">
                                        <label>Sub-Kategori</label>
                                        <input type="text" class="form-control" placeholder="Herb, Ore..." value="${escapeHtml(subCat)}" onchange="setTagVal(item, 'NUSV Subcategory', this.value);">
                                    </div>
                                    <div class="form-group">
                                        <label title="Wilayah atau kerajaan tempat item ini ditemukan">Origin Region</label>
                                        <input type="text" class="form-control" placeholder="Nusvanir..." value="${escapeHtml(region)}" onchange="setTagVal(item, 'NUSV Region', this.value);">
                                    </div>
                                    <div class="form-group">
                                        <label>Sumber / Asal</label>
                                        <input type="text" class="form-control" placeholder="Drop, Quest..." value="${escapeHtml(source)}" onchange="setTagVal(item, 'NUSV Source', this.value);">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PERMATA SOKET & SINTESIS -->
                <div class="grid-2">
                    <div class="card">
                        <div class="card-header"><h2 title="Pengaturan properti batu permata untuk soket perlengkapan">💎 Gem Socket Configuration</h2></div>
                        <div class="card-body">
                            <div class="grid-2">
                                <label class="checkbox-label">
                                    <input type="checkbox" ${isSocket ? 'checked' : ''} onchange="setBoolTag(item, 'Socket Item', this.checked);">
                                    <span style="font-weight:700; color:var(--accent);" title="Tandai jika barang ini adalah batu permata yang dapat dipasang ke slot soket senjata/zirah">Socket Gem Item</span>
                                </label>
                                <select class="form-control" onchange="onItemSocketTargetChange(this.value)">
                                    <option value="Any" ${socketTarget === 'Any' ? 'selected' : ''} title="Batu permata dapat dipasang di senjata maupun zirah">Any (Weapons &amp; Armors)</option>
                                    <option value="Weapon" ${socketTarget === 'Weapon' ? 'selected' : ''} title="Batu permata hanya dapat dipasang di senjata">Weapons Only</option>
                                    <option value="Armor" ${socketTarget === 'Armor' ? 'selected' : ''} title="Batu permata hanya dapat dipasang di zirah/pelindung">Armors Only</option>
                                </select>
                            </div>
                            <div class="stat-grid-6" style="margin-top:10px;">
                                <div class="stat-card-input">
                                    <label style="color:#fb923c;">⚔️ ATK</label>
                                    <input type="text" class="form-control" placeholder="+5" value="${sockAtk}" onchange="setTagVal(item, 'Socket ATK', this.value);">
                                </div>
                                <div class="stat-card-input" style="border-left: 2px solid #34d399;">
                                    <label style="color:#34d399;">🛡️ DEF</label>
                                    <input type="text" class="form-control" placeholder="+5" value="${sockDef}" onchange="setTagVal(item, 'Socket DEF', this.value);">
                                </div>
                                <div class="stat-card-input" style="border-left: 2px solid #a78bfa;">
                                    <label style="color:#a78bfa;">🔮 MAT</label>
                                    <input type="text" class="form-control" placeholder="+5" value="${sockMat}" onchange="setTagVal(item, 'Socket MAT', this.value);">
                                </div>
                                <div class="stat-card-input" style="border-left: 2px solid #38bdf8;">
                                    <label style="color:#38bdf8;">🔰 MDF</label>
                                    <input type="text" class="form-control" placeholder="+5" value="${sockMdf}" onchange="setTagVal(item, 'Socket MDF', this.value);">
                                </div>
                                <div class="stat-card-input" style="border-left: 2px solid #f87171;">
                                    <label style="color:#f87171;">❤️ HP</label>
                                    <input type="text" class="form-control" placeholder="+50" value="${sockMhp}" onchange="setTagVal(item, 'Socket MHP', this.value);">
                                </div>
                                <div class="stat-card-input" style="border-left: 2px solid #60a5fa;">
                                    <label style="color:#60a5fa;">💧 MP</label>
                                    <input type="text" class="form-control" placeholder="+20" value="${sockMmp}" onchange="setTagVal(item, 'Socket MMP', this.value);">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header"><h2>🔨 Sintesis / Crafting (NUSV_ItemSynthesis)</h2></div>
                        <div class="card-body">
                            <div class="form-group">
                                <label>Kategori Resep (&lt;Synthesis Category: ...&gt;)</label>
                                <input type="text" class="form-control" placeholder="Forge, Alchemy, Cooking..." value="${escapeHtml(synCat)}" onchange="setTagVal(item, 'Synthesis Category', this.value);">
                            </div>
                            <div class="form-group">
                                <label>Jumlah Hasil Buatan (&lt;Synthesis Amount: X&gt;)</label>
                                <input type="number" min="1" class="form-control" placeholder="1" value="${synAmt}" onchange="setTagVal(item, 'Synthesis Amount', this.value);">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- NOTETAG MENTAH -->
                <div class="card">
                    <div class="card-header"><h2 title="Editor teks langsung untuk seluruh notetag">📝 Raw Notetags (Direct Edit)</h2></div>
                    <div class="card-body">
                        <textarea id="rawNoteTextarea" class="form-control" rows="6" onchange="onRawNoteInput(this.value)">${escapeHtml(item.note || '')}</textarea>
                    </div>
                </div>
            `;
        }

        function onItemSocketTargetChange(val) {
            const item = State.items[State.selectedIndex];
            setBoolTag(item, 'Socket Weapon Only', false);
            setBoolTag(item, 'Socket Armor Only', false);
            if (val === 'Weapon') {
                setBoolTag(item, 'Socket Weapon Only', true);
            } else if (val === 'Armor') {
                setBoolTag(item, 'Socket Armor Only', true);
            }
        }

        // =====================================================================
        // 7. ENEMIES EDITOR
        // =====================================================================
        function renderEnemyEditor(container, enemy) {
            ensureItemParams(enemy);
            const note = enemy.note || '';
            const lvlTag = getTagVal(note, 'Enemy Level', 'Party');
            const variance = getTagVal(note, 'Level Variance', '0');
            const minLvl = getTagVal(note, 'Minimum Level', '');
            const maxLvl = getTagVal(note, 'Maximum Level', '');
            const noLvlScale = hasTag(note, 'No Level Scaling');
            const noDiffScale = hasTag(note, 'No Difficulty Scaling');

            const paramGrowth = getTagVal(note, 'Param Growth', '');
            const expGrowth = getTagVal(note, 'EXP Growth', '');
            const goldGrowth = getTagVal(note, 'Gold Growth', '');

            const enemyType = getTagVal(note, 'NUSV Enemy Type', '') || getTagVal(note, 'Enemy Type', '');
            const enemyRank = getTagVal(note, 'NUSV Enemy Rank', 'Normal');
            const tier = getTagVal(note, 'NUSV Tier', '1');
            const element = getTagVal(note, 'NUSV Element', '');
            const weakness = getTagVal(note, 'NUSV Weakness', '');
            const classExp = getTagVal(note, 'Class EXP', '');
            const jp = getTagVal(note, 'JP', '');

            enemy.dropItems = enemy.dropItems || [
                { kind: 0, dataId: 1, denominator: 1 },
                { kind: 0, dataId: 1, denominator: 1 },
                { kind: 0, dataId: 1, denominator: 1 }
            ];
            enemy.actions = enemy.actions || [];

            container.innerHTML = `
                <!-- ENEMY IDENTITY & GRAPHICS -->
                <div class="card">
                    <div class="card-header">
                        <h2 title="Pengaturan parameter tempur dan perilaku AI musuh">👾 Enemy: #${enemy.id} ${escapeHtml(enemy.name)}</h2>
                        <span style="font-size:0.85rem; color:var(--text-muted);">${escapeHtml(enemyRank)} • Tier ${tier}</span>
                    </div>
                    <div class="card-body">
                        <div class="grid-2">
                            <div>
                                <div class="form-group">
                                    <label title="Nama musuh yang ditampilkan saat pertarungan">Enemy Name</label>
                                    <input type="text" class="form-control" value="${escapeHtml(enemy.name || '')}" onchange="enemy.name=this.value; setUnsaved(true); renderSidebar();">
                                </div>
                                <div class="grid-2">
                                    <div class="form-group">
                                        <label title="Jumlah pengalaman EXP yang diperoleh tim saat musuh ini berhasil dikalahkan">EXP Reward</label>
                                        <input type="number" min="0" class="form-control" value="${enemy.exp || 0}" onchange="enemy.exp=parseInt(this.value,10); setUnsaved(true);">
                                    </div>
                                    <div class="form-group">
                                        <label title="Jumlah mata uang emas yang dijatuhkan saat musuh dikalahkan">Gold Reward</label>
                                        <input type="number" min="0" class="form-control" value="${enemy.gold || 0}" onchange="enemy.gold=parseInt(this.value,10); setUnsaved(true);">
                                    </div>
                                </div>
                                <div class="grid-2">
                                    <div class="form-group">
                                        <label title="Kategori ras monster (misal Beast, Undead, Demon, Humanoid)">Enemy Race Type</label>
                                        <input type="text" class="form-control" placeholder="Beast, Undead, Demon..." value="${escapeHtml(enemyType)}" onchange="setTagVal(enemy, 'NUSV Enemy Type', this.value); setTagVal(enemy, 'Enemy Type', this.value);">
                                    </div>
                                    <div class="form-group">
                                        <label title="Tingkatan ancaman musuh: Normal, Elite, Mini-Boss, World Boss, Raid Boss">Threat Rank</label>
                                        <select class="form-control" onchange="setTagVal(enemy, 'NUSV Enemy Rank', this.value);">
                                            ${['Normal', 'Elite', 'Mini-Boss', 'Boss', 'World Boss'].map(r => `<option value="${r}" ${enemyRank === r ? 'selected' : ''}>${r}</option>`).join('')}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div class="form-group">
                                    <label title="Pilih gambar battler monster dari folder img/enemies/">Select Battler Graphic (img/enemies/)</label>
                                    <select class="form-control" onchange="enemy.battlerName=this.value.replace(/\.png$/i, ''); setUnsaved(true); renderEditor();">
                                        <option value="">(Kosong)</option>
                                        ${State.enemiesPics.map(e => {
                                            const clean = e.replace(/\.png$/i, '');
                                            return `<option value="${clean}" ${enemy.battlerName === clean ? 'selected' : ''}>${e}</option>`;
                                        }).join('')}
                                    </select>
                                </div>
                                <div class="portrait-preview-box" style="height:140px;">
                                    ${enemy.battlerName ? `<img src="img/enemies/${enemy.battlerName}.png" class="portrait-img" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'portrait-empty\\'>⚠️ ${enemy.battlerName}.png tidak ditemukan</div>';">` : `<div class="portrait-empty">Tanpa gambar battler</div>`}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ENEMY BASE PARAMETERS -->
                <div class="card">
                    <div class="card-header">
                        <h2 title="Parameter tempur dasar musuh">📊 Enemy Base Parameters</h2>
                        <span style="font-size:0.8rem; color:var(--text-muted);">Base combat parameter values for this enemy.</span>
                    </div>
                    <div class="card-body">
                        <div class="stat-grid-8">
                            ${PARAM_DEFS.map(p => `
                                <div class="stat-card-input">
                                    <label style="color:${p.color};">
                                        <span>${p.icon} ${p.code}</span>
                                        <span style="font-size:0.75rem; color:var(--text-muted);">${p.name}</span>
                                    </label>
                                    <input type="number" min="0" class="form-control" value="${enemy.params[p.id] || 0}" onchange="enemy.params[${p.id}]=parseInt(this.value,10)||0; setUnsaved(true);">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                
                <!-- DROP ITEMS (3 SLOTS) -->
                <div class="card">
                    <div class="card-header">
                        <h2 title="Daftar barang rampasan yang dijatuhkan saat musuh ini dikalahkan">🎁 Drop Items (Spoils of War)</h2>
                    </div>
                    <div class="card-body">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th style="width:10%;" title="Nomor slot drop (Slot 1, 2, atau 3)">Slot</th>
                                    <th style="width:25%;" title="Kategori barang rampasan: Item biasa, Senjata, atau Pelindung/Zirah">Drop Kind</th>
                                    <th style="width:40%;" title="Pilih barang spesifik yang dijatuhkan">Item Name</th>
                                    <th style="width:25%;" title="Peluang drop 1 banding N (contoh: 1 = 100%, 2 = 50%, 10 = 10%)">Probability (1 / N)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${[0, 1, 2].map(slotIdx => {
                                    const d = enemy.dropItems[slotIdx] || { kind: 0, dataId: 1, denominator: 1 };
                                    enemy.dropItems[slotIdx] = d;

                                    let optionsHtml = '<option value="0">(None)</option>';
                                    if (d.kind === 1) { // Item
                                        optionsHtml += State.items.filter(it => it).map(it => `<option value="${it.id}" ${d.dataId === it.id ? 'selected' : ''}>#${it.id} ${escapeHtml(it.name)}</option>`).join('');
                                    } else if (d.kind === 2) { // Weapon
                                        optionsHtml += State.weapons.filter(w => w).map(w => `<option value="${w.id}" ${d.dataId === w.id ? 'selected' : ''}>#${w.id} ${escapeHtml(w.name)}</option>`).join('');
                                    } else if (d.kind === 3) { // Armor
                                        optionsHtml += State.armors.filter(a => a).map(a => `<option value="${a.id}" ${d.dataId === a.id ? 'selected' : ''}>#${a.id} ${escapeHtml(a.name)}</option>`).join('');
                                    }

                                    return `
                                        <tr>
                                            <td style="font-weight:700; color:var(--accent);">Drop ${slotIdx + 1}</td>
                                            <td>
                                                <select class="form-control" onchange="enemy.dropItems[${slotIdx}].kind=parseInt(this.value); enemy.dropItems[${slotIdx}].dataId=1; setUnsaved(true); renderEditor();">
                                                    <option value="0" ${d.kind === 0 ? 'selected' : ''}>None</option>
                                                    <option value="1" ${d.kind === 1 ? 'selected' : ''}>Item</option>
                                                    <option value="2" ${d.kind === 2 ? 'selected' : ''}>Weapon</option>
                                                    <option value="3" ${d.kind === 3 ? 'selected' : ''}>Armor</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select class="form-control" ${d.kind === 0 ? 'disabled' : ''} onchange="enemy.dropItems[${slotIdx}].dataId=parseInt(this.value); setUnsaved(true);">
                                                    ${optionsHtml}
                                                </select>
                                            </td>
                                            <td>
                                                <div style="display:flex; align-items:center; gap:6px;">
                                                    <span style="color:var(--text-muted); font-size:0.85rem;">1 /</span>
                                                    <input type="number" min="1" max="1000" class="form-control" value="${d.denominator || 1}" ${d.kind === 0 ? 'disabled' : ''} onchange="enemy.dropItems[${slotIdx}].denominator=Math.max(1, parseInt(this.value) || 1); setUnsaved(true);">
                                                    <span style="color:var(--text-muted); font-size:0.75rem;">(${Math.round(100 / (d.denominator || 1))}%)</span>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
        

                <!-- ACTION PATTERNS (AI) -->
                <div class="card">
                    <div class="card-header">
                        <h2 title="Daftar pola aksi kecerdasan buatan (AI) musuh dalam pertarungan">⚔️ Enemy Action Patterns (AI)</h2>
                        <button class="btn btn-secondary btn-sm" onclick="addEnemyAction();" title="Tambah pola aksi baru ke daftar kecerdasan buatan musuh">➕ Add Action Pattern</button>
                    </div>
                    <div class="card-body">
                        <div style="overflow-x:auto;">
                            <table class="stat-table">
                                <thead>
                                    <tr>
                                        <th style="width:45%;">Skill yang Digunakan</th>
                                        <th style="width:20%;">Rating Prioritas (1-9)</th>
                                        <th style="width:25%;" title="Kondisi pemicu agar skill ini dipilih oleh AI musuh">Usage Condition</th>
                                        <th style="width:10%; text-align:right;">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${enemy.actions.length === 0 ? `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:16px;">No action patterns configured. Click "+ Add Action Pattern" above.</td></tr>` : ''}
                                    ${enemy.actions.map((act, i) => `
                                        <tr>
                                            <td>
                                                <select class="form-control" style="padding:4px 8px; font-size:0.85rem;" onchange="enemy.actions[${i}].skillId=parseInt(this.value,10); setUnsaved(true);">
                                                    ${State.skills.filter(s => s).map(s => `<option value="${s.id}" ${act.skillId === s.id ? 'selected' : ''}>#${s.id} ${escapeHtml(s.name)}</option>`).join('')}
                                                </select>
                                            </td>
                                            <td>
                                                <input type="number" min="1" max="9" class="form-control" style="padding:4px 8px; font-size:0.85rem;" value="${act.rating || 5}" onchange="enemy.actions[${i}].rating=parseInt(this.value,10); setUnsaved(true);">
                                            </td>
                                            <td>
                                                <select class="form-control" style="padding:4px 8px; font-size:0.85rem;" onchange="enemy.actions[${i}].conditionType=parseInt(this.value,10); setUnsaved(true);">
                                                    <option value="0" ${act.conditionType === 0 ? 'selected' : ''}>Selalu (Always)</option>
                                                    <option value="1" ${act.conditionType === 1 ? 'selected' : ''}>Berdasarkan Turn Giliran</option>
                                                    <option value="2" ${act.conditionType === 2 ? 'selected' : ''} title="Aktif saat HP musuh berada dalam persentase tertentu">By Enemy HP %</option>
                                                    <option value="3" ${act.conditionType === 3 ? 'selected' : ''} title="Aktif saat MP musuh berada dalam persentase tertentu">By Enemy MP %</option>
                                                    <option value="4" ${act.conditionType === 4 ? 'selected' : ''} title="Aktif jika musuh sedang terpengaruh status efek tertentu">When State Active</option>
                                                    <option value="5" ${act.conditionType === 5 ? 'selected' : ''} title="Aktif berdasarkan level rata-rata party">By Party Level</option>
                                                </select>
                                            </td>
                                            <td style="text-align:right;">
                                                <button class="btn btn-danger btn-sm" onclick="removeEnemyAction(${i});">🗑️</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- LEVEL SCALING & HADIAH NUSVANIR -->
                <div class="grid-2">
                    <div class="card">
                        <div class="card-header"><h2 title="Pengaturan penyesuaian level musuh berdasarkan party pemain">📈 Enemy Level Scaling</h2></div>
                        <div class="card-body">
                            <div class="form-group">
                                <label title="Metode penentuan level musuh: Tetap (Fixed), Skala Party, atau Rentang Level">Enemy Level Scaling Mode</label>
                                <input type="text" class="form-control" placeholder="Party, atau 10, atau 5 to 15" value="${escapeHtml(lvlTag)}" onchange="setTagVal(enemy, 'Enemy Level', this.value);">
                            </div>
                            <div class="grid-3">
                                <div class="form-group">
                                    <label title="Variasi acak tingkat level musuh di sekitar level rata-rata party">Level Variance (±X)</label>
                                    <input type="number" class="form-control" value="${variance}" onchange="setTagVal(enemy, 'Level Variance', this.value);">
                                </div>
                                <div class="form-group">
                                    <label title="Batas level paling rendah yang mungkin dimiliki musuh ini">Minimum Level Floor</label>
                                    <input type="number" class="form-control" value="${minLvl}" onchange="setTagVal(enemy, 'Minimum Level', this.value);">
                                </div>
                                <div class="form-group">
                                    <label title="Batas level paling tinggi yang mungkin dicapai musuh ini">Maximum Level Cap</label>
                                    <input type="number" class="form-control" value="${maxLvl}" onchange="setTagVal(enemy, 'Maximum Level', this.value);">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header"><h2 title="Hadiah pengalaman kelas, job points, dan drop batu jiwa monster">🎁 Nusvanir Special Rewards</h2></div>
                        <div class="card-body">
                            <div class="grid-2">
                                <div class="form-group">
                                    <label title="EXP kelas khusus yang diberikan musuh ini">Class EXP Reward</label>
                                    <input type="number" class="form-control" placeholder="25" value="${classExp}" onchange="setTagVal(enemy, 'Class EXP', this.value);">
                                </div>
                                <div class="form-group">
                                    <label title="Poin keahlian (JP) yang didapatkan party">Job Points (JP) Reward</label>
                                    <input type="number" class="form-control" placeholder="20" value="${jp}" onchange="setTagVal(enemy, 'JP', this.value);">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- NOTETAG MENTAH -->
                <div class="card">
                    <div class="card-header"><h2 title="Editor teks langsung untuk seluruh notetag">📝 Raw Notetags (Direct Edit)</h2></div>
                    <div class="card-body">
                        <textarea id="rawNoteTextarea" class="form-control" rows="6" onchange="onRawNoteInput(this.value)">${escapeHtml(enemy.note || '')}</textarea>
                    </div>
                </div>
            `;
        }

        function addEnemyAction() {
            const enemy = State.enemies[State.selectedIndex];
            enemy.actions = enemy.actions || [];
            enemy.actions.push({ skillId: 1, rating: 5, conditionType: 0, conditionParam1: 0, conditionParam2: 0 });
            setUnsaved(true);
            renderEditor();
        }

        function removeEnemyAction(index) {
            const enemy = State.enemies[State.selectedIndex];
            if (enemy.actions && enemy.actions[index]) {
                enemy.actions.splice(index, 1);
                setUnsaved(true);
                renderEditor();
            }
        }

        // =====================================================================
        // 8. STATES EDITOR
        // =====================================================================
        function renderStateEditor(container, state) {
            const note = state.note || '';
            const currentType = getTagVal(note, 'NUSV Type', '2');
            const currentDesc = getTagVal(note, 'NUSV Desc', state.description || '');

            const critDmg = getTagVal(note, 'Critical Damage', '');
            const armPen = getTagVal(note, 'Armor Penetration', '');
            const magPen = getTagVal(note, 'Magic Penetration', '');
            const pdr = getTagVal(note, 'PDR Plus', '');
            const mdr = getTagVal(note, 'MDR Plus', '');
            const hit = getTagVal(note, 'HIT Plus', '');
            const eva = getTagVal(note, 'EVA Plus', '');
            const cri = getTagVal(note, 'CRI Plus', '');
            const grd = getTagVal(note, 'GRD Plus', '');
            const cnt = getTagVal(note, 'CNT Plus', '');

            const coreBonuses = {};
            CORE_ATTRIBUTES.forEach(a => {
                coreBonuses[a.code] = getTagVal(note, a.code, '');
            });
            const maxSpBonus = getTagVal(note, 'Max SP', '');

            const RESTRICTIONS = {
                0: 'None (Free Action)',
                1: 'Attack an Enemy',
                2: 'Attack Anyone',
                3: 'Serang Teman (Attack Ally)',
                4: 'Cannot Move'
            };

            const REMOVAL_TIMINGS = {
                0: 'Tidak Otomatis (None)',
                1: 'Akhir Aksi Battler (Action End)',
                2: 'Akhir Putaran Turn (Turn End)'
            };

            container.innerHTML = `
                <!-- STATE IDENTITY & RESTRICTIONS -->
                <div class="card">
                    <div class="card-header">
                        <h2 title="Pengaturan efek status, buff, debuff, dan durasi">💫 State: #${state.id} ${escapeHtml(state.name)}</h2>
                        <span style="font-size:0.85rem; color:var(--text-muted);">Prioritas: ${state.priority}</span>
                    </div>
                    <div class="card-body">
                        <div class="grid-2">
                            <div>
                                <div class="grid-2">
                                    <div class="form-group">
                                        <label title="Nama status efek yang ditampilkan saat pertarungan atau menu status">State Name</label>
                                        <input type="text" class="form-control" value="${escapeHtml(state.name || '')}" onchange="state.name=this.value; setUnsaved(true); renderSidebar();">
                                    </div>
                                    <div class="form-group">
                                        <label title="Indeks nomor visual ikon barang dari file IconSet.png">Icon Index</label>
                                        <input type="number" class="form-control" value="${state.iconIndex || 0}" onchange="state.iconIndex=parseInt(this.value,10); setUnsaved(true);">
                                    </div>
                                </div>

                                <div class="grid-2">
                                    <div class="form-group">
                                        <label title="Klasifikasi status efek: Buff Positif, Debuff Negatif, Status Ailment, atau Pasif">Nusvanir State Type</label>
                                        <select class="form-control" onchange="setTagVal(state, 'NUSV Type', this.value); renderSidebar();">
                                            <option value="1" ${currentType === '1' ? 'selected' : ''}>1 - Buff (Menguntungkan - Hijau)</option>
                                            <option value="2" ${currentType === '2' ? 'selected' : ''}>2 - Debuff (Merugikan - Merah)</option>
                                            <option value="3" ${currentType === '3' ? 'selected' : ''}>3 - Pasif / Khusus (Ungu)</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label title="Urutan prioritas penulisan ikon jika battler terkena banyak status sekaligus">Display Priority (1-100)</label>
                                        <input type="number" min="1" max="100" class="form-control" value="${state.priority || 50}" onchange="state.priority=parseInt(this.value,10); setUnsaved(true);">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label title="Batasan aksi yang dialami battler (misal Tidak Bisa Bergerak, Serang Kawan, dll.)">Action Restriction</label>
                                    <select class="form-control" onchange="state.restriction=parseInt(this.value,10); setUnsaved(true);">
                                        ${Object.keys(RESTRICTIONS).map(k => `<option value="${k}" ${state.restriction === parseInt(k,10) ? 'selected' : ''}>${RESTRICTIONS[k]}</option>`).join('')}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <div class="form-group">
                                    <label title="Penjelasan efek status yang muncul saat kursor diarahkan ke ikon status di game">Tooltip Description (&lt;NUSV Desc&gt;)</label>
                                    <textarea class="form-control" rows="4" onchange="setTagVal(state, 'NUSV Desc', this.value);">${escapeHtml(currentDesc)}</textarea>
                                </div>

                                <div class="grid-3">
                                    <div class="form-group">
                                        <label title="Kapan status ini berpeluang dilepas secara otomatis (Akhir Aksi, Akhir Giliran, atau Tidak)">Auto-Removal Timing</label>
                                        <select class="form-control" onchange="state.autoRemovalTiming=parseInt(this.value,10); setUnsaved(true);">
                                            ${Object.keys(REMOVAL_TIMINGS).map(k => `<option value="${k}" ${state.autoRemovalTiming === parseInt(k,10) ? 'selected' : ''}>${REMOVAL_TIMINGS[k]}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Min Turns</label>
                                        <input type="number" min="0" class="form-control" value="${state.minTurns || 1}" onchange="state.minTurns=parseInt(this.value,10); setUnsaved(true);">
                                    </div>
                                    <div class="form-group">
                                        <label>Max Turns</label>
                                        <input type="number" min="0" class="form-control" value="${state.maxTurns || 1}" onchange="state.maxTurns=parseInt(this.value,10); setUnsaved(true);">
                                    </div>
                                </div>

                                <div class="grid-2" style="margin-top:6px;">
                                    <label class="checkbox-label">
                                        <input type="checkbox" ${state.removeAtBattleEnd ? 'checked' : ''} onchange="state.removeAtBattleEnd=this.checked; setUnsaved(true);">
                                        <span title="Apakah status ini otomatis dihapus saat pertarungan berakhir">Remove at Battle End</span>
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" ${state.removeByDamage ? 'checked' : ''} onchange="state.removeByDamage=this.checked; setUnsaved(true);">
                                        <span title="Peluang persentase status ini terlepas saat terkena serangan">Remove by Damage (${state.chanceByDamage || 0}%)</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- MODIFIKASI ATRIBUT NUSVANIR -->
                <div class="card">
                    <div class="card-header">
                        <h2>📊 Modifikasi Atribut Stat Nusvanir</h2>
                        <span style="font-size:0.8rem; color:var(--text-muted);">&lt;STR: +X / -X&gt; etc. Active while state is afflicted on battler.</span>
                    </div>
                    <div class="card-body">
                        <div class="stat-grid-6">
                            ${CORE_ATTRIBUTES.map(attr => `
                                <div class="stat-card-input">
                                    <label style="color:${attr.color};">
                                        <span>${attr.icon} ${attr.code}</span>
                                        <span style="font-size:0.75rem; color:var(--text-muted);">${attr.name}</span>
                                    </label>
                                    <input type="text" class="form-control" placeholder="+0" value="${coreBonuses[attr.code]}" onchange="setTagVal(state, '${attr.code}', this.value);">
                                </div>
                            `).join('')}
                        </div>
                        <div class="form-group" style="margin-top:12px; max-width:240px;">
                            <label title="Modifikasi nilai kapasitas stamina maksimal (<Max SP: +X>)">Max SP Modifier (&lt;Max SP&gt;)</label>
                            <input type="text" class="form-control" placeholder="+0" value="${maxSpBonus}" onchange="setTagVal(state, 'Max SP', this.value);">
                        </div>
                    </div>
                </div>

                <!-- MODIFIKASI TEMPUR EKSTRA -->
                <div class="card">
                    <div class="card-header"><h2>⚔️ Modifikasi Parameter Tempur Ekstra</h2></div>
                    <div class="card-body">
                        <div class="grid-3">
                            <div class="form-group">
                                <label title="Modifikasi pengali kerusakan saat menghasilkan kritikal (<Critical Damage: +X%>)">Critical Damage Modifier</label>
                                <input type="text" class="form-control" placeholder="+25%" value="${critDmg}" onchange="setTagVal(state, 'Critical Damage', this.value);">
                            </div>
                            <div class="form-group">
                                <label title="Modifikasi pengabaian persen pertahanan fisik target (<Armor Penetration: +X%>)">Armor Penetration Modifier</label>
                                <input type="text" class="form-control" placeholder="15%" value="${armPen}" onchange="setTagVal(state, 'Armor Penetration', this.value);">
                            </div>
                            <div class="form-group">
                                <label title="Modifikasi pengabaian persen pertahanan sihir target (<Magic Penetration: +X%>)">Magic Penetration Modifier</label>
                                <input type="text" class="form-control" placeholder="15%" value="${magPen}" onchange="setTagVal(state, 'Magic Penetration', this.value);">
                            </div>
                        </div>

                        <div class="grid-4" style="margin-top:10px;">
                            <div class="form-group">
                                <label title="Modifikasi pengurangan persen kerusakan fisik yang diterima (<PDR Plus: +X%>)">Physical Damage Reduction Modifier</label>
                                <input type="text" class="form-control" placeholder="-15%" value="${pdr}" onchange="setTagVal(state, 'PDR Plus', this.value);">
                            </div>
                            <div class="form-group">
                                <label title="Modifikasi pengurangan persen kerusakan sihir yang diterima (<MDR Plus: +X%>)">Magical Damage Reduction Modifier</label>
                                <input type="text" class="form-control" placeholder="-15%" value="${mdr}" onchange="setTagVal(state, 'MDR Plus', this.value);">
                            </div>
                            <div class="form-group">
                                <label title="Modifikasi akurasi serangan fisik (<HIT Plus: +X%>)">Hit Rate Modifier</label>
                                <input type="text" class="form-control" placeholder="+10%" value="${hit}" onchange="setTagVal(state, 'HIT Plus', this.value);">
                            </div>
                            <div class="form-group">
                                <label title="Modifikasi peluang menghindari serangan fisik (<EVA Plus: +X%>)">Evasion Rate Modifier</label>
                                <input type="text" class="form-control" placeholder="+10%" value="${eva}" onchange="setTagVal(state, 'EVA Plus', this.value);">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- NOTETAG MENTAH -->
                
                <!-- 📈 INTERACTIVE EXP PROGRESSION CURVE & GRAPH -->
                <div class="card" style="margin-top:16px; border: 1px solid rgba(56, 189, 248, 0.4); box-shadow: 0 4px 20px rgba(56, 189, 248, 0.1);">
                    <div class="card-header" style="background: linear-gradient(90deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95)); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                        <div>
                            <h2 title="Kurva visual perkembangan EXP yang dibutuhkan untuk naik level dari Lv 1 sampai Lv 99">📈 Class EXP Progression Curve &amp; Visual Graph</h2>
                            <div style="font-size:0.8rem; color:var(--text-muted);">Interactive real-time graph plotting Total EXP and Level scaling.</div>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <button type="button" class="btn btn-sm btn-secondary" onclick="toggleExpTableModal()" title="Lihat tabel rincian EXP per level (Lv 1 - 99)">📋 View Lv 1-99 Table</button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="grid-2" style="gap:20px; align-items:start;">
                            <!-- LEFT: 4 PARAMETERS & SLIDERS -->
                            <div>
                                <div style="font-size:0.82rem; font-weight:700; color:#38bdf8; margin-bottom:12px;">🎛️ EXP Formula Parameters (Curve Controls):</div>

                                <!-- Param 1: Base Value -->
                                <div class="form-group" style="margin-bottom:12px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                        <label style="margin:0; font-size:0.82rem;" title="Nilai dasar pengali kurva EXP (standar 10-50)">Base Value</label>
                                        <span id="expParamBadge0" class="badge-sub">${cls.expParams[0] || 30}</span>
                                    </div>
                                    <div style="display:flex; gap:10px; align-items:center;">
                                        <input type="range" min="10" max="50" value="${cls.expParams[0] || 30}" class="form-control" style="flex:1; cursor:pointer;" 
                                               oninput="onExpParamChange(0, this.value)">
                                        <input type="number" min="10" max="50" value="${cls.expParams[0] || 30}" class="form-control" style="width:70px; text-align:center;" 
                                               id="expInputNum0" onchange="onExpParamChange(0, this.value)">
                                    </div>
                                </div>

                                <!-- Param 2: Extra Value -->
                                <div class="form-group" style="margin-bottom:12px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                        <label style="margin:0; font-size:0.82rem;" title="Tambahan EXP linier datar per level (standar 10-50)">Extra Value</label>
                                        <span id="expParamBadge1" class="badge-sub">${cls.expParams[1] || 20}</span>
                                    </div>
                                    <div style="display:flex; gap:10px; align-items:center;">
                                        <input type="range" min="10" max="50" value="${cls.expParams[1] || 20}" class="form-control" style="flex:1; cursor:pointer;" 
                                               oninput="onExpParamChange(1, this.value)">
                                        <input type="number" min="10" max="50" value="${cls.expParams[1] || 20}" class="form-control" style="width:70px; text-align:center;" 
                                               id="expInputNum1" onchange="onExpParamChange(1, this.value)">
                                    </div>
                                </div>

                                <!-- Param 3: Acceleration A -->
                                <div class="form-group" style="margin-bottom:12px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                        <label style="margin:0; font-size:0.82rem;" title="Percepatan kurva eksponensial untuk level menengah ke atas">Acceleration A</label>
                                        <span id="expParamBadge2" class="badge-sub">${cls.expParams[2] || 30}</span>
                                    </div>
                                    <div style="display:flex; gap:10px; align-items:center;">
                                        <input type="range" min="10" max="50" value="${cls.expParams[2] || 30}" class="form-control" style="flex:1; cursor:pointer;" 
                                               oninput="onExpParamChange(2, this.value)">
                                        <input type="number" min="10" max="50" value="${cls.expParams[2] || 30}" class="form-control" style="width:70px; text-align:center;" 
                                               id="expInputNum2" onchange="onExpParamChange(2, this.value)">
                                    </div>
                                </div>

                                <!-- Param 4: Acceleration B -->
                                <div class="form-group" style="margin-bottom:14px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                        <label style="margin:0; font-size:0.82rem;" title="Peredam kecuraman kurva pada level tinggi">Acceleration B</label>
                                        <span id="expParamBadge3" class="badge-sub">${cls.expParams[3] || 30}</span>
                                    </div>
                                    <div style="display:flex; gap:10px; align-items:center;">
                                        <input type="range" min="10" max="50" value="${cls.expParams[3] || 30}" class="form-control" style="flex:1; cursor:pointer;" 
                                               oninput="onExpParamChange(3, this.value)">
                                        <input type="number" min="10" max="50" value="${cls.expParams[3] || 30}" class="form-control" style="width:70px; text-align:center;" 
                                               id="expInputNum3" onchange="onExpParamChange(3, this.value)">
                                    </div>
                                </div>

                                <!-- Presets -->
                                <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:6px;">Quick Curve Presets:</div>
                                <div style="display:flex; gap:6px; flex-wrap:wrap;">
                                    <button type="button" class="btn btn-secondary btn-sm" onclick="applyExpPreset([20, 10, 20, 20])" title="Kurva cepat: naik level lebih mudah">🚀 Fast (Easy)</button>
                                    <button type="button" class="btn btn-secondary btn-sm" onclick="applyExpPreset([30, 20, 30, 30])" title="Kurva seimbang standar RPG Maker">⚖️ Normal (Standard)</button>
                                    <button type="button" class="btn btn-secondary btn-sm" onclick="applyExpPreset([40, 25, 35, 30])" title="Kurva lambat: butuh grinding lebih banyak">⛰️ Hard (Steep)</button>
                                    <button type="button" class="btn btn-secondary btn-sm" onclick="applyExpPreset([25, 10, 45, 25])" title="Kurva lambat di awal, eksponensial di akhir">👑 Late Bloomer</button>
                                </div>
                            </div>

                            <!-- RIGHT: LIVE CANVAS GRAPH -->
                            <div>
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                    <div style="font-size:0.82rem; font-weight:700; color:#38bdf8;">📈 Live Progression Graph (Lv 1 - 99):</div>
                                    <div id="expHoverTooltip" style="font-size:0.75rem; color:#facc15; font-weight:600; min-height:18px;">Hover graph to view level details</div>
                                </div>

                                <div class="exp-canvas-wrapper">
                                    <canvas id="expCurveCanvas" width="580" height="230" style="width:100%; height:100%; display:block; cursor:crosshair;"></canvas>
                                </div>

                                <!-- Milestones Grid -->
                                <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; margin-top:10px;">
                                    <div class="stat-card-input" style="padding:8px; text-align:center;">
                                        <div style="font-size:0.7rem; color:var(--text-muted);">Lv 10 Total EXP</div>
                                        <div style="font-size:0.95rem; font-weight:700; color:#38bdf8;" id="milestoneExp10">-</div>
                                    </div>
                                    <div class="stat-card-input" style="padding:8px; text-align:center;">
                                        <div style="font-size:0.7rem; color:var(--text-muted);">Lv 30 Total EXP</div>
                                        <div style="font-size:0.95rem; font-weight:700; color:#60a5fa;" id="milestoneExp30">-</div>
                                    </div>
                                    <div class="stat-card-input" style="padding:8px; text-align:center;">
                                        <div style="font-size:0.7rem; color:var(--text-muted);">Lv 50 Total EXP</div>
                                        <div style="font-size:0.95rem; font-weight:700; color:#a78bfa;" id="milestoneExp50">-</div>
                                    </div>
                                    <div class="stat-card-input" style="padding:8px; text-align:center;">
                                        <div style="font-size:0.7rem; color:var(--text-muted);">Lv 99 Max EXP</div>
                                        <div style="font-size:0.95rem; font-weight:700; color:#facc15;" id="milestoneExp99">-</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
    

                <div class="card">
                    <div class="card-header"><h2 title="Editor teks langsung untuk seluruh notetag">📝 Raw Notetags (Direct Edit)</h2></div>
                    <div class="card-body">
                        <textarea id="rawNoteTextarea" class="form-control" rows="6" onchange="onRawNoteInput(this.value)">${escapeHtml(state.note || '')}</textarea>
                    </div>
                </div>
            `;
        }

        // =====================================================================
        // SAVE & BACKUP HANDLER
        // =====================================================================
        async function saveActiveDataset() {
            const tabMap = {
                actors: { filename: 'Actors.json', data: () => State.actors },
                classes: { filename: 'Classes.json', data: () => State.classes },
                weapons: { filename: 'Weapons.json', data: () => State.weapons },
                armors: { filename: 'Armors.json', data: () => State.armors },
                skills: { filename: 'Skills.json', data: () => State.skills },
                items: { filename: 'Items.json', data: () => State.items },
                enemies: { filename: 'Enemies.json', data: () => State.enemies },
                states: { filename: 'States.json', data: () => State.states }
            };

            // Collect all modified tabs and the current active tab
            const tabsToSave = new Set(State.modifiedTabs || []);
            if (State.currentTab && tabMap[State.currentTab]) {
                tabsToSave.add(State.currentTab);
            }

            if (tabsToSave.size === 0) {
                showToast('Tidak ada perubahan untuk disimpan.', 'info');
                return;
            }

            let savedFiles = [];
            for (const tab of tabsToSave) {
                const info = tabMap[tab];
                if (!info) continue;
                const filename = info.filename;
                const data = info.data();
                if (!data) continue;

                showToast(`Menyimpan ${filename}...`, 'info');
                try {
                    const res = await fetch(getApiUrl(`/api/save/${filename}`), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    const result = await res.json();
                    if (result.status === 'ok') {
                        savedFiles.push(filename);
                    } else {
                        throw new Error(result.message || 'Gagal menyimpan');
                    }
                } catch (err) {
                    console.error(err);
                    showToast(`Gagal menyimpan ${filename}: ${err.message}`, 'error');
                    return;
                }
            }

            if (savedFiles.length > 0) {
                setUnsaved(false);
                showToast(`Berhasil menyimpan ${savedFiles.join(', ')} (backup otomatis tersimpan)!`, 'success');
            }
        }

        function setUnsaved(status) {
            State.hasUnsavedChanges = status;
            if (status) {
                if (!State.modifiedTabs) State.modifiedTabs = new Set();
                if (State.currentTab) State.modifiedTabs.add(State.currentTab);
            } else {
                if (State.modifiedTabs) State.modifiedTabs.clear();
            }
            const badge = document.getElementById('unsavedBadge');
            if (badge) {
                badge.style.display = status ? 'inline-block' : 'none';
            }
        }

        function showToast(message, type = 'info') {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            const icon = document.getElementById('toastIcon');

            toast.className = `toast show ${type}`;
            msg.innerText = message;

            if (type === 'success') icon.innerText = '✅';
            else if (type === 'error') icon.innerText = '❌';
            else icon.innerText = 'ℹ️';

            clearTimeout(window.toastTimer);
            window.toastTimer = setTimeout(() => {
                toast.classList.remove('show');
            }, 3200);
        }

        
        // Real-time Indonesian description on hover
        document.addEventListener('mouseover', (e) => {
            const el = e.target.closest('[title]');
            const bar = document.getElementById('hoverInfoBar');
            const txt = document.getElementById('hoverInfoText');
            if (!bar || !txt) return;
            if (el && el.getAttribute('title')) {
                const title = el.getAttribute('title');
                let name = el.innerText || el.getAttribute('placeholder') || el.getAttribute('name') || '';
                name = name.replace(/[\r\n\t]+/g, ' ').trim().slice(0, 35);
                txt.innerHTML = `💡 <strong style="color:#60a5fa;">${escapeHtml(name || 'Info')}:</strong> ${escapeHtml(title)}`;
                bar.classList.add('visible');
            }
        });
        document.addEventListener('mouseout', (e) => {
            const toEl = e.relatedTarget ? e.relatedTarget.closest('[title]') : null;
            if (!toEl) {
                const bar = document.getElementById('hoverInfoBar');
                if (bar) bar.classList.remove('visible');
            }
        });
    
        
        // ==========================================
        // GRAPHIC PREVIEW & VISUAL SHEET PICKER
        // ==========================================
        function renderFacePreviewHtml(faceName, faceIndex) {
            if (!faceName) {
                return '<div class="empty-preview" title="Belum ada gambar wajah yang dipilih">No Face Graphic<br><span style="font-size:0.7rem; color:var(--text-muted);">Choose below</span></div>';
            }
            const idx = Number(faceIndex) || 0;
            const col = idx % 4;
            const row = Math.floor(idx / 4);
            const posX = (col / 3.0) * 100.0;
            const posY = (row / 1.0) * 100.0;
            const url = `img/faces/${encodeURIComponent(faceName)}.png`;
            return `<div class="pixel-sprite face-frame" style="background-image: url('${url}'); background-size: 400% 200%; background-position: ${posX.toFixed(1)}% ${posY.toFixed(1)}%;" title="Wajah Indeks ${idx} (Klik untuk buka sheet)"></div>`;
        }

        function renderCharPreviewHtml(charName, charIndex) {
            if (!charName) {
                return '<div class="empty-preview" title="Belum ada sprite berjalan yang dipilih">No Character Sprite<br><span style="font-size:0.7rem; color:var(--text-muted);">Choose below</span></div>';
            }
            const isSingle = charName.startsWith('$');
            const url = `img/characters/${encodeURIComponent(charName)}.png`;
            if (isSingle) {
                return `<div class="pixel-sprite char-frame" style="background-image: url('${url}'); background-size: 300% 400%; background-position: 50% 0%;" title="Single Character Sprite ($)"></div>`;
            }
            const idx = Number(charIndex) || 0;
            const col = idx % 4;
            const row = Math.floor(idx / 4);
            const frameX = col * 3 + 1; // standing frame down
            const frameY = row * 4 + 0; // facing down
            const posX = (frameX / 11.0) * 100.0;
            const posY = (frameY / 7.0) * 100.0;
            return `<div class="pixel-sprite char-frame" style="background-image: url('${url}'); background-size: 1200% 800%; background-position: ${posX.toFixed(1)}% ${posY.toFixed(1)}%;" title="Sprite Indeks ${idx} (Klik untuk buka sheet)"></div>`;
        }

        function renderSvPreviewHtml(svName) {
            if (!svName) {
                return '<div class="empty-preview" title="Belum ada battler tempur yang dipilih">No Battler Graphic<br><span style="font-size:0.7rem; color:var(--text-muted);">Choose below</span></div>';
            }
            const url = `img/sv_actors/${encodeURIComponent(svName)}.png`;
            return `<div class="pixel-sprite sv-frame" style="background-image: url('${url}'); background-size: 900% 600%; background-position: 0% 0%;" title="[SV] Idle Battler Pose"></div>`;
        }

        function onActorFaceChange(val) {
            const actor = State.actors[State.selectedIndex];
            if (!actor) return;
            actor.faceName = val.replace(/\.png$/i, '');
            setUnsaved(true);
            updateActorGraphicsLive();
        }

        function onActorFaceIndexChange(idx) {
            const actor = State.actors[State.selectedIndex];
            if (!actor) return;
            actor.faceIndex = Number(idx);
            setUnsaved(true);
            updateActorGraphicsLive();
        }

        function onActorCharChange(val) {
            const actor = State.actors[State.selectedIndex];
            if (!actor) return;
            actor.characterName = val.replace(/\.png$/i, '');
            setUnsaved(true);
            updateActorGraphicsLive();
        }

        function onActorCharIndexChange(idx) {
            const actor = State.actors[State.selectedIndex];
            if (!actor) return;
            actor.characterIndex = Number(idx);
            setUnsaved(true);
            updateActorGraphicsLive();
        }

        function onActorSvChange(val) {
            const actor = State.actors[State.selectedIndex];
            if (!actor) return;
            actor.battlerName = val.replace(/\.png$/i, '');
            setUnsaved(true);
            updateActorGraphicsLive();
        }

        function updateActorGraphicsLive() {
            const actor = State.actors[State.selectedIndex];
            if (!actor) return;

            // Update Face Box
            const faceBox = document.getElementById('facePreviewBox');
            if (faceBox) faceBox.innerHTML = renderFacePreviewHtml(actor.faceName, actor.faceIndex || 0);
            const faceBadge = document.getElementById('faceIndexLabel');
            if (faceBadge) faceBadge.innerText = `Index ${actor.faceIndex || 0}`;

            document.querySelectorAll('#faceIndexGrid .idx-btn').forEach((btn, i) => {
                btn.classList.toggle('active', Number(actor.faceIndex || 0) === i);
            });

            // Update Character Box
            const charBox = document.getElementById('charPreviewBox');
            if (charBox) charBox.innerHTML = renderCharPreviewHtml(actor.characterName, actor.characterIndex || 0);
            const charBadge = document.getElementById('charIndexLabel');
            const isSingle = (actor.characterName || '').startsWith('$');
            if (charBadge) charBadge.innerText = isSingle ? 'Single ($)' : `Index ${actor.characterIndex || 0}`;

            document.querySelectorAll('#charIndexGrid .idx-btn').forEach((btn, i) => {
                btn.disabled = isSingle;
                btn.classList.toggle('active', Number(actor.characterIndex || 0) === i && !isSingle);
            });

            // Update SV Box
            const svBox = document.getElementById('svPreviewBox');
            if (svBox) svBox.innerHTML = renderSvPreviewHtml(actor.battlerName);
        }

        function openGraphicSheetModal(type) {
            const actor = State.actors[State.selectedIndex];
            if (!actor) return;

            const modal = document.getElementById('graphicModal');
            const titleEl = document.getElementById('graphicModalTitle');
            const bodyEl = document.getElementById('graphicModalBody');
            if (!modal || !titleEl || !bodyEl) return;

            if (type === 'face') {
                if (!actor.faceName) {
                    showToast('Pilih file Face Graphic terlebih dahulu di dropdown!', 'info');
                    return;
                }
                titleEl.innerText = `Select Face Frame: ${actor.faceName}.png`;
                const url = `img/faces/${encodeURIComponent(actor.faceName)}.png`;
                const currentIdx = Number(actor.faceIndex) || 0;

                // 4 cols x 2 rows
                let cellsHtml = '';
                for (let idx = 0; idx < 8; idx++) {
                    const col = idx % 4;
                    const row = Math.floor(idx / 4);
                    const left = (col * 25).toFixed(1);
                    const top = (row * 50).toFixed(1);
                    const isSel = idx === currentIdx ? 'selected' : '';
                    cellsHtml += `
                        <div class="sheet-click-cell ${isSel}" style="left:${left}%; top:${top}%; width:25%; height:50%;" 
                             onclick="onActorFaceIndexChange(${idx}); closeGraphicModal(); showToast('Face Index diubah ke ${idx}', 'success');"
                             title="Klik untuk memilih wajah index #${idx}">
                            <span class="sheet-cell-badge">Face #${idx}</span>
                        </div>
                    `;
                }

                bodyEl.innerHTML = `
                    <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:12px; text-align:center;">
                        Klik pada kotak wajah yang ingin kamu gunakan untuk karakter ini (Index 0 - 7):
                    </div>
                    <div class="sheet-canvas-container" style="width:576px; height:288px; max-width:100%;">
                        <img src="${url}" style="width:100%; height:100%; object-fit:fill; image-rendering:pixelated; display:block;">
                        ${cellsHtml}
                    </div>
                `;
                modal.style.display = 'flex';

            } else if (type === 'character') {
                if (!actor.characterName) {
                    showToast('Pilih file Character Sprite terlebih dahulu di dropdown!', 'info');
                    return;
                }
                const isSingle = actor.characterName.startsWith('$');
                titleEl.innerText = `Select Character Frame: ${actor.characterName}.png`;
                const url = `img/characters/${encodeURIComponent(actor.characterName)}.png`;

                if (isSingle) {
                    bodyEl.innerHTML = `
                        <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:12px; text-align:center;">
                            Ini adalah spritesheet satu karakter tunggal ($prefix).
                        </div>
                        <div class="sheet-canvas-container" style="max-height:400px; max-width:100%;">
                            <img src="${url}" style="max-height:380px; image-rendering:pixelated; display:block;">
                        </div>
                    `;
                } else {
                    const currentIdx = Number(actor.characterIndex) || 0;
                    // 4 cols x 2 rows
                    let cellsHtml = '';
                    for (let idx = 0; idx < 8; idx++) {
                        const col = idx % 4;
                        const row = Math.floor(idx / 4);
                        const left = (col * 25).toFixed(1);
                        const top = (row * 50).toFixed(1);
                        const isSel = idx === currentIdx ? 'selected' : '';
                        cellsHtml += `
                            <div class="sheet-click-cell ${isSel}" style="left:${left}%; top:${top}%; width:25%; height:50%;" 
                                 onclick="onActorCharIndexChange(${idx}); closeGraphicModal(); showToast('Character Index diubah ke ${idx}', 'success');"
                                 title="Klik untuk memilih karakter index #${idx}">
                                <span class="sheet-cell-badge">Char #${idx}</span>
                            </div>
                        `;
                    }

                    bodyEl.innerHTML = `
                        <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:12px; text-align:center;">
                            Klik pada blok karakter yang ingin digunakan dari sheet ini (Index 0 - 7):
                        </div>
                        <div class="sheet-canvas-container" style="width:576px; height:384px; max-width:100%;">
                            <img src="${url}" style="width:100%; height:100%; object-fit:fill; image-rendering:pixelated; display:block;">
                            ${cellsHtml}
                        </div>
                    `;
                }
                modal.style.display = 'flex';
            }
        }

        function closeGraphicModal() {
            const modal = document.getElementById('graphicModal');
            if (modal) modal.style.display = 'none';
        }
    
        
        // ==========================================
        // EXP CURVE CALCULATION & CANVAS VISUALIZER
        // ==========================================
        function calculateExpForLevel(level, expParams) {
            if (level <= 1) return 0;
            const basis = expParams[0] || 30;
            const extra = expParams[1] || 20;
            const acc_a = expParams[2] || 30;
            const acc_b = expParams[3] || 30;
            return Math.round(
                basis * (Math.pow(level - 1, 0.9 + acc_a / 250)) * level * (level + 1) /
                (6 + Math.pow(level, 2) / 50 / acc_b) + (level - 1) * extra
            );
        }

        function formatExpNum(num) {
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return Math.round(num / 1000) + 'k';
            return String(num);
        }

        function onExpParamChange(paramIndex, value) {
            const cls = State.classes[State.selectedIndex];
            if (!cls) return;
            cls.expParams = cls.expParams || [30, 20, 30, 30];
            const val = Math.max(10, Math.min(50, parseInt(value, 10) || 10));
            cls.expParams[paramIndex] = val;

            // Sync slider and number input
            const badge = document.getElementById(`expParamBadge${paramIndex}`);
            if (badge) badge.innerText = val;
            const numInput = document.getElementById(`expInputNum${paramIndex}`);
            if (numInput && numInput.value != val) numInput.value = val;

            setUnsaved(true);
            drawExpCurveGraph();
            updateExpMilestones();
        }

        function applyExpPreset(params) {
            const cls = State.classes[State.selectedIndex];
            if (!cls || !Array.isArray(params)) return;
            cls.expParams = [...params];

            for (let i = 0; i < 4; i++) {
                const badge = document.getElementById(`expParamBadge${i}`);
                if (badge) badge.innerText = params[i];
                const numInput = document.getElementById(`expInputNum${i}`);
                if (numInput) numInput.value = params[i];
                const slider = document.querySelector(`input[type="range"][oninput*="onExpParamChange(${i}"]`);
                if (slider) slider.value = params[i];
            }

            setUnsaved(true);
            drawExpCurveGraph();
            updateExpMilestones();
            showToast('Preset Kurva EXP diterapkan!', 'info');
        }

        function updateExpMilestones() {
            const cls = State.classes[State.selectedIndex];
            if (!cls) return;
            const p = cls.expParams || [30, 20, 30, 30];

            const exp10 = calculateExpForLevel(10, p);
            const exp30 = calculateExpForLevel(30, p);
            const exp50 = calculateExpForLevel(50, p);
            const exp99 = calculateExpForLevel(99, p);

            const m10 = document.getElementById('milestoneExp10');
            if (m10) m10.innerText = exp10.toLocaleString();
            const m30 = document.getElementById('milestoneExp30');
            if (m30) m30.innerText = exp30.toLocaleString();
            const m50 = document.getElementById('milestoneExp50');
            if (m50) m50.innerText = exp50.toLocaleString();
            const m99 = document.getElementById('milestoneExp99');
            if (m99) m99.innerText = exp99.toLocaleString();
        }

        let expHoverLevel = null;

        function drawExpCurveGraph(hoverX = null) {
            const canvas = document.getElementById('expCurveCanvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const cls = State.classes[State.selectedIndex];
            if (!cls) return;

            const p = cls.expParams || [30, 20, 30, 30];
            const maxLevel = 99;
            const maxExp = calculateExpForLevel(maxLevel, p);

            // Responsive sizing
            const rect = canvas.getBoundingClientRect();
            if (rect.width > 0 && (canvas.width !== Math.round(rect.width) || canvas.height !== Math.round(rect.height))) {
                canvas.width = Math.round(rect.width);
                canvas.height = Math.round(rect.height);
            }

            const w = canvas.width;
            const h = canvas.height;
            const padL = 52;
            const padR = 24;
            const padT = 20;
            const padB = 30;
            const graphW = w - padL - padR;
            const graphH = h - padT - padB;

            ctx.clearRect(0, 0, w, h);

            // Background
            ctx.fillStyle = '#0b0f19';
            ctx.fillRect(0, 0, w, h);

            // Gridlines & Y-Axis Labels
            const ySteps = 4;
            ctx.lineWidth = 1;
            ctx.textAlign = 'right';
            ctx.font = '10px sans-serif';

            for (let i = 0; i <= ySteps; i++) {
                const ratio = i / ySteps;
                const y = padT + graphH * (1 - ratio);
                const val = Math.round(maxExp * ratio);

                ctx.strokeStyle = i === 0 ? '#334155' : 'rgba(51, 65, 85, 0.4)';
                ctx.beginPath();
                ctx.moveTo(padL, y);
                ctx.lineTo(w - padR, y);
                ctx.stroke();

                ctx.fillStyle = '#94a3b8';
                ctx.fillText(formatExpNum(val), padL - 8, y + 3);
            }

            // X-Axis Labels (Levels)
            const xMilestones = [1, 20, 40, 60, 80, 99];
            ctx.textAlign = 'center';

            xMilestones.forEach(lv => {
                const x = padL + ((lv - 1) / (maxLevel - 1)) * graphW;
                ctx.strokeStyle = 'rgba(51, 65, 85, 0.3)';
                ctx.beginPath();
                ctx.moveTo(x, padT);
                ctx.lineTo(x, h - padB);
                ctx.stroke();

                ctx.fillStyle = '#94a3b8';
                ctx.fillText(`Lv ${lv}`, x, h - padB + 16);
            });

            // Calculate Curve Points
            const points = [];
            for (let lv = 1; lv <= maxLevel; lv++) {
                const expVal = calculateExpForLevel(lv, p);
                const x = padL + ((lv - 1) / (maxLevel - 1)) * graphW;
                const y = padT + graphH * (1 - (maxExp > 0 ? (expVal / maxExp) : 0));
                points.push({ lv, x, y, exp: expVal });
            }

            // Filled Gradient Area under curve
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(points[0].x, h - padB);
            points.forEach(pt => ctx.lineTo(pt.x, pt.y));
            ctx.lineTo(points[points.length - 1].x, h - padB);
            ctx.closePath();

            const grad = ctx.createLinearGradient(0, padT, 0, h - padB);
            grad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
            grad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.restore();

            // Glowing Curve Line
            ctx.save();
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 8;
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#38bdf8';
            ctx.beginPath();
            points.forEach((pt, i) => {
                if (i === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            });
            ctx.stroke();
            ctx.restore();

            // Hover crosshair & tooltip
            if (hoverX !== null && hoverX >= padL && hoverX <= w - padR) {
                const ratioX = (hoverX - padL) / graphW;
                const targetLv = Math.max(1, Math.min(99, Math.round(1 + ratioX * 98)));
                const pt = points[targetLv - 1];

                if (pt) {
                    // Vertical dashed line
                    ctx.save();
                    ctx.setLineDash([4, 4]);
                    ctx.strokeStyle = '#facc15';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(pt.x, padT);
                    ctx.lineTo(pt.x, h - padB);
                    ctx.stroke();
                    ctx.restore();

                    // Dot on curve
                    ctx.save();
                    ctx.shadowColor = '#facc15';
                    ctx.shadowBlur = 10;
                    ctx.fillStyle = '#facc15';
                    ctx.beginPath();
                    ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();

                    // Update tooltip bar above graph
                    const nextLvExp = targetLv < 99 ? (calculateExpForLevel(targetLv + 1, p) - pt.exp) : 0;
                    const tooltipEl = document.getElementById('expHoverTooltip');
                    if (tooltipEl) {
                        tooltipEl.innerHTML = `🎯 <strong style="color:#fff;">Level ${targetLv}</strong> • Total EXP: <span style="color:#38bdf8;">${pt.exp.toLocaleString()}</span> • Next Lv: <span style="color:#a78bfa;">+${nextLvExp.toLocaleString()} EXP</span>`;
                    }
                }
            }
        }

        function initExpCanvasListeners() {
            const canvas = document.getElementById('expCurveCanvas');
            if (!canvas || canvas.dataset.hasListener) return;
            canvas.dataset.hasListener = 'true';

            canvas.addEventListener('mousemove', (e) => {
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                drawExpCurveGraph(x);
            });

            canvas.addEventListener('mouseleave', () => {
                drawExpCurveGraph(null);
                const tooltipEl = document.getElementById('expHoverTooltip');
                if (tooltipEl) tooltipEl.innerText = 'Hover graph to view level details';
            });
        }

        function toggleExpTableModal() {
            const cls = State.classes[State.selectedIndex];
            if (!cls) return;
            const p = cls.expParams || [30, 20, 30, 30];
            const modal = document.getElementById('expTableModal');
            const titleEl = document.getElementById('expTableModalTitle');
            const bodyEl = document.getElementById('expTableModalBody');
            if (!modal || !titleEl || !bodyEl) return;

            titleEl.innerText = `${cls.name || 'Class'} - Level by Level EXP Table (Lv 1 - 99)`;
            let rowsHtml = '';
            let prevTotal = 0;

            for (let lv = 1; lv <= 99; lv++) {
                const total = calculateExpForLevel(lv, p);
                const next = lv < 99 ? (calculateExpForLevel(lv + 1, p) - total) : 0;
                rowsHtml += `
                    <tr>
                        <td style="text-align:center; font-weight:700; color:var(--accent);">Lv ${lv}</td>
                        <td style="text-align:right; color:#a78bfa;">${next.toLocaleString()}</td>
                        <td style="text-align:right; font-weight:700; color:#38bdf8;">${total.toLocaleString()}</td>
                    </tr>
                `;
            }

            bodyEl.innerHTML = rowsHtml;
            modal.style.display = 'flex';
        }

        function closeExpTableModal() {
            const modal = document.getElementById('expTableModal');
            if (modal) modal.style.display = 'none';
        }
    
        function escapeHtml(text) {
            if (!text) return '';
            return String(text)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }
    </script>

    <!-- Floating Bottom Hover Info Bar -->
    <div id="hoverInfoBar" class="hover-info-bar">
        <span id="hoverInfoText">💡 Hover over any label or element to see description in Indonesian.</span>
    </div>
    

    <!-- Visual Graphic Sheet Modal -->
    <div id="graphicModal" class="modal-overlay" style="display:none;" onclick="if(event.target === this) closeGraphicModal();">
        <div class="modal-card">
            <div class="modal-header">
                <h3 id="graphicModalTitle">Select Sprite Frame</h3>
                <button class="btn btn-sm btn-secondary" onclick="closeGraphicModal()">✕ Close</button>
            </div>
            <div class="modal-body" id="graphicModalBody">
                <!-- Dynamically populated sheet picker -->
            </div>
        </div>
    </div>
    

    <!-- EXP Table Modal (Lv 1 - 99) -->
    <div id="expTableModal" class="modal-overlay" style="display:none;" onclick="if(event.target === this) closeExpTableModal();">
        <div class="modal-card" style="width: 560px;">
            <div class="modal-header">
                <h3 id="expTableModalTitle">Class EXP Progression Table (Lv 1 - 99)</h3>
                <button class="btn btn-sm btn-secondary" onclick="closeExpTableModal()">✕ Close</button>
            </div>
            <div class="modal-body" style="padding: 12px; max-height: 70vh; overflow-y: auto;">
                <table class="data-table" style="font-size: 0.85rem; width: 100%;">
                    <thead>
                        <tr>
                            <th style="width: 20%; text-align:center;">Level</th>
                            <th style="width: 40%; text-align:right;">Next Level EXP</th>
                            <th style="width: 40%; text-align:right;">Total Accumulated EXP</th>
                        </tr>
                    </thead>
                    <tbody id="expTableModalBody">
                        <!-- Populated dynamically -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
</body>
</html>
'''

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write(HTML_CONTENT.strip() + "\n")

print(f"Successfully generated {OUTPUT_FILE} ({len(HTML_CONTENT)} bytes)")
