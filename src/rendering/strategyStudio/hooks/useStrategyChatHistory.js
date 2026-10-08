'use client';

import { useState, useEffect, useCallback } from 'react';
import { strategyStudioApi } from '../utils/strategyApi';
import { getStoredUserId } from '@/lib/authSession';
import { toast } from '@/components/toast';

export default function useStrategyChatHistory({ setMessages, setCurrentDraft, setCurrentStrategy }) {
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [historyList, setHistoryList] = useState([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);

    /**
     * Action 3: Load Sidebar History List
     * GET /backtest/v1/wizard/chat-sessions/{user_id}?limit=30
     */
    const loadHistoryList = useCallback(async () => {
        const userId = getStoredUserId();
        if (!userId) return;

        setHistoryLoading(true);
        try {
            const res = await strategyStudioApi.getChatSessions(userId, 30);
            if (res && (res.status === 'success' || Array.isArray(res.data))) {
                const sessions = Array.isArray(res.data) ? res.data : (res.data?.sessions || []);
                setHistoryList(sessions);
            }
        } catch (err) {
            console.warn('[useStrategyChatHistory] loadHistoryList error:', err);
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    useEffect(() => {
        loadHistoryList();
    }, [loadHistoryList]);

    /**
     * Action 1: When User Clicks "+ New Chat"
     */
    const handleNewChat = useCallback(() => {
        setCurrentSessionId(null);
        if (setMessages) setMessages([]);
        if (setCurrentDraft) setCurrentDraft(null);
        if (setCurrentStrategy) setCurrentStrategy(null);
        setIsHistoryOpen(false);
    }, [setMessages, setCurrentDraft, setCurrentStrategy]);

    /**
     * Action 4: When User Clicks a Chat in History
     * GET /backtest/v1/wizard/chat-sessions/{user_id}?session_id={sessionId}
     */
    const handleSelectHistorySession = useCallback(async (sessionId) => {
        if (!sessionId) return;
        const userId = getStoredUserId();
        setCurrentSessionId(sessionId);
        setIsHistoryOpen(false);

        if (!userId) return;

        try {
            const res = await strategyStudioApi.getSessionMessages(userId, sessionId);
            if (res && (res.status === 'success' || res.data)) {
                const sessionData = res.data || {};
                const rawMessages = sessionData.messages || sessionData.chat_history || [];

                if (Array.isArray(rawMessages) && rawMessages.length > 0) {
                    const normalized = rawMessages.map((m) => ({
                        role: (m.role === 'user' || m.role === 'human') ? 'user' : 'ai',
                        text: m.content || m.text || m.message || '',
                        draft: m.draft || null,
                        qaList: m.answers || m.qaList || null
                    }));
                    if (setMessages) setMessages(normalized);
                }

                if (sessionData.draft && setCurrentDraft) {
                    setCurrentDraft(sessionData.draft);
                }
                if (sessionData.strategy && setCurrentStrategy) {
                    setCurrentStrategy(sessionData.strategy);
                }
            }
        } catch (err) {
            console.warn('[useStrategyChatHistory] handleSelectHistorySession error:', err);
            toast.error('Failed to load chat history session.');
        }
    }, [setMessages, setCurrentDraft, setCurrentStrategy]);

    /**
     * Action 5: Delete a Chat Session
     * DELETE /backtest/v1/wizard/chat-sessions/{user_id}/{sessionId}
     */
    const handleDeleteSession = useCallback(async (sessionId, e) => {
        if (e) e.stopPropagation();
        const userId = getStoredUserId();
        if (!userId || !sessionId) return;

        try {
            await strategyStudioApi.deleteChatSession(userId, sessionId);
            // If deleted active session, reset chat window
            if (currentSessionId === sessionId) {
                handleNewChat();
            }
            // Refresh history list
            loadHistoryList();
            toast.success('Chat session deleted.');
        } catch (err) {
            console.warn('[useStrategyChatHistory] handleDeleteSession error:', err);
            toast.error('Failed to delete chat session.');
        }
    }, [currentSessionId, handleNewChat, loadHistoryList]);

    return {
        currentSessionId,
        setCurrentSessionId,
        historyList,
        isHistoryOpen,
        setIsHistoryOpen,
        historyLoading,
        loadHistoryList,
        handleNewChat,
        handleSelectHistorySession,
        handleDeleteSession
    };
}
