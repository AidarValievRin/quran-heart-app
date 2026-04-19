import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFamilyCircleStore } from '../../store/familyCircleStore';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing, Radius } from '../../theme';

export function FamilyCircleScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const circleName = useFamilyCircleStore((s) => s.circleName);
  const setCircleName = useFamilyCircleStore((s) => s.setCircleName);
  const inviteCode = useFamilyCircleStore((s) => s.inviteCode);
  const members = useFamilyCircleStore((s) => s.members);
  const addMember = useFamilyCircleStore((s) => s.addMember);
  const removeMember = useFamilyCircleStore((s) => s.removeMember);
  const setMemberSurahs = useFamilyCircleStore((s) => s.setMemberSurahs);
  const goal = useFamilyCircleStore((s) => s.familyGoalSurahsRamadan);
  const setGoal = useFamilyCircleStore((s) => s.setFamilyGoal);
  const regen = useFamilyCircleStore((s) => s.regenerateInvite);

  const [draft, setDraft] = useState('');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <Text style={[styles.note, { color: colors.textSecondary }]}>{t('community.family.note')}</Text>
      <TextInput
        placeholder={t('community.family.circleNamePh')}
        placeholderTextColor={colors.textSecondary}
        value={circleName}
        onChangeText={setCircleName}
        style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.bgCard }]}
      />
      <Text style={{ color: colors.textPrimary, marginTop: Spacing.md, fontWeight: '600' }}>
        {t('community.family.invite')}
      </Text>
      <Text style={{ color: colors.accentGreen, fontSize: 20, marginVertical: 6 }}>{inviteCode}</Text>
      <TouchableOpacity onPress={regen}>
        <Text style={{ color: colors.accentGreen }}>{t('community.family.regen')}</Text>
      </TouchableOpacity>
      <Text style={{ color: colors.textSecondary, marginTop: Spacing.md }}>{t('community.family.goal', { n: goal })}</Text>
      <TextInput
        keyboardType="number-pad"
        placeholder="30"
        placeholderTextColor={colors.textSecondary}
        defaultValue={String(goal)}
        onEndEditing={(e) => setGoal(Math.max(1, parseInt(e.nativeEvent.text, 10) || 30))}
        style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.bgCard }]}
      />
      <View style={styles.addRow}>
        <TextInput
          placeholder={t('community.family.memberPh')}
          placeholderTextColor={colors.textSecondary}
          value={draft}
          onChangeText={setDraft}
          style={[
            styles.input,
            { flex: 1, borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.bgCard },
          ]}
        />
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.accentGreen }]}
          onPress={() => {
            addMember(draft);
            setDraft('');
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>{t('community.family.add')}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={members}
        keyExtractor={(m) => m.id}
        ListEmptyComponent={<Text style={{ color: colors.textSecondary }}>{t('community.family.empty')}</Text>}
        renderItem={({ item }) => (
          <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
            <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{item.name}</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
              {t('community.family.surahsRead', { n: item.surahsRead })}
            </Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm }}>
              <TouchableOpacity
                style={[styles.mini, { borderColor: colors.border }]}
                onPress={() => setMemberSurahs(item.id, Math.max(0, item.surahsRead - 1))}
              >
                <Text style={{ color: colors.textPrimary }}>−</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.mini, { borderColor: colors.border }]}
                onPress={() => setMemberSurahs(item.id, Math.min(114, item.surahsRead + 1))}
              >
                <Text style={{ color: colors.textPrimary }}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeMember(item.id)}>
                <Text style={{ color: colors.textSecondary }}>{t('community.family.remove')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: Spacing.md },
  note: { fontSize: 11, lineHeight: 16, marginBottom: Spacing.md },
  input: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.sm },
  addRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md, alignItems: 'center' },
  addBtn: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderRadius: Radius.md },
  card: { padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, marginTop: Spacing.sm },
  mini: { width: 36, height: 36, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
