import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/useGameStore';
import { useUIStore } from '../stores/useUIStore';
import GameLayout from '../components/layout/GameLayout';
import Modal from '../components/modal/Modal';
import BuyPropertyModal from '../components/modal/BuyPropertyModal';
import CardModal from '../components/modal/CardModal';
import GameOverModal from '../components/modal/GameOverModal';
import PropertyDetailModal from '../components/modal/PropertyDetailModal';
import { GamePhase } from '../types/game';

export default function GamePage() {
  const navigate = useNavigate();
  const phase = useGameStore((s) => s.gameState.phase);
  const activeModal = useUIStore((s) => s.activeModal);
  const modalData = useUIStore((s) => s.modalData);
  const closeModal = useUIStore((s) => s.closeModal);
  
  // 检查游戏是否已初始化
  useEffect(() => {
    const state = useGameStore.getState();
    if (state.gameState.players.length === 0) {
      navigate('/');
    }
  }, [navigate]);
  
  // 根据游戏阶段自动打开弹窗
  useEffect(() => {
    if (phase === GamePhase.GAME_OVER && activeModal !== 'game_over') {
      useUIStore.getState().openModal('game_over', {});
    }
  }, [phase, activeModal]);
  
  const renderModal = () => {
    switch (activeModal) {
      case 'buy_property':
        return <BuyPropertyModal />;
      case 'card_effect':
        return <CardModal />;
      case 'game_over':
        return <GameOverModal />;
      case 'property_detail':
        return <PropertyDetailModal propertyId={modalData.propertyId as string} />;
      default:
        return null;
    }
  };
  
  return (
    <>
      <GameLayout />
      <Modal isOpen={!!activeModal} onClose={closeModal}>
        {renderModal()}
      </Modal>
    </>
  );
}
