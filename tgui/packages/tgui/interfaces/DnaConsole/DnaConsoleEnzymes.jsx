import {
  Box,
  Button,
  Collapsible,
  Dimmer,
  Divider,
  Icon,
  LabeledList,
  NumberInput,
  Section,
  Stack,
  Tabs,
} from 'tgui-core/components';

import { useBackend } from '../../backend';
import {
  CONSOLE_MODE_ENZYMES,
  CONSOLE_MODE_FEATURES,
  PULSE_DURATION_MAX,
  PULSE_STRENGTH_MAX,
} from './constants';
import { DnaConsoleAppearance } from './DnaConsoleAppearance';
import { GeneticMakeupInfo } from './GeneticMakeupInfo';

const GeneticMakeupBufferInfo = (props) => {
  const { index, makeup } = props;
  const { act, data } = useBackend();
  const { isViableSubject, hasDisk, diskReadOnly, isInjectorReady } = data;
  // Type of the action for applying makeup
  const ACTION_MAKEUP_APPLY = isViableSubject ? 'makeup_apply' : 'makeup_delay';
  if (!makeup) {
    return <Box color="average">No stored subject data.</Box>;
  }
  return (
    <>
      <GeneticMakeupInfo makeup={makeup} />
      <Divider />
      <Box bold color="label" mb={1}>
        Makeup Actions
      </Box>
      <LabeledList>
        <LabeledList.Item label="Enzymes">
          <Button
            icon="syringe"
            disabled={!isInjectorReady}
            content="Print"
            onClick={() =>
              act('makeup_injector', {
                index,
                type: 'ue',
              })
            }
          />
          <Button
            icon="exchange-alt"
            onClick={() =>
              act(ACTION_MAKEUP_APPLY, {
                index,
                type: 'ue',
              })
            }
          >
            Transfer
            {!isViableSubject && ' (Delayed)'}
          </Button>
        </LabeledList.Item>
        <LabeledList.Item label="Identity">
          <Button
            icon="syringe"
            disabled={!isInjectorReady}
            content="Print"
            onClick={() =>
              act('makeup_injector', {
                index,
                type: 'ui',
              })
            }
          />
          <Button
            icon="exchange-alt"
            onClick={() =>
              act(ACTION_MAKEUP_APPLY, {
                index,
                type: 'ui',
              })
            }
          >
            Transfer
            {!isViableSubject && ' (Delayed)'}
          </Button>
        </LabeledList.Item>
        <LabeledList.Item label="Features">
          <Button
            icon="syringe"
            disabled={!isInjectorReady}
            content="Print"
            onClick={() =>
              act('makeup_injector', {
                index,
                type: 'uf',
              })
            }
          />
          <Button
            icon="exchange-alt"
            onClick={() =>
              act(ACTION_MAKEUP_APPLY, {
                index,
                type: 'uf',
              })
            }
          >
            Transfer
            {!isViableSubject && ' (Delayed)'}
          </Button>
        </LabeledList.Item>
        <LabeledList.Item label="Full Makeup">
          <Button
            icon="syringe"
            disabled={!isInjectorReady}
            content="Print"
            onClick={() =>
              act('makeup_injector', {
                index,
                type: 'mixed',
              })
            }
          />
          <Button
            icon="exchange-alt"
            onClick={() =>
              act(ACTION_MAKEUP_APPLY, {
                index,
                type: 'mixed',
              })
            }
          >
            Transfer
            {!isViableSubject && ' (Delayed)'}
          </Button>
        </LabeledList.Item>
        <LabeledList.Item>
          <Button
            icon="save"
            disabled={!hasDisk || diskReadOnly}
            content="Export To Disk"
            onClick={() =>
              act('save_makeup_disk', {
                index,
              })
            }
          />
        </LabeledList.Item>
      </LabeledList>
    </>
  );
};

const GeneticMakeupBuffers = (props) => {
  const { data, act } = useBackend();
  const {
    diskHasMakeup,
    geneticMakeupCooldown,
    hasDisk,
    isViableSubject,
    makeupCapacity = 3,
    makeupStorage,
  } = data;
  const elements = [];
  for (let i = 1; i <= makeupCapacity; i++) {
    const makeup = makeupStorage[i];
    const element = (
      <Collapsible
        title={makeup ? makeup.label || makeup.name : `Slot ${i}`}
        buttons={
          <>
            {!!(hasDisk && diskHasMakeup) && (
              <Button
                mr={1}
                disabled={!hasDisk || !diskHasMakeup}
                content="Import from disk"
                onClick={() =>
                  act('load_makeup_disk', {
                    index: i,
                  })
                }
              />
            )}
            <Button
              disabled={!isViableSubject}
              content="Save"
              onClick={() =>
                act('save_makeup_console', {
                  index: i,
                })
              }
            />
            <Button
              ml={1}
              icon="times"
              color="red"
              disabled={!makeup}
              onClick={() =>
                act('del_makeup_console', {
                  index: i,
                })
              }
            />
          </>
        }
      >
        <GeneticMakeupBufferInfo index={i} makeup={makeup} />
      </Collapsible>
    );
    elements.push(element);
  }
  return (
    <Section title="Genetic Makeup Buffers">
      {!!geneticMakeupCooldown && (
        <Dimmer fontSize="14px" textAlign="center">
          <Icon mr={1} name="spinner" spin />
          Genetic makeup transfer ready in...
          <Box mt={1} />
          {geneticMakeupCooldown}s
        </Dimmer>
      )}
      {elements}
    </Section>
  );
};

const PulseSettings = () => {
  const { data, act } = useBackend();
  const {
    pulseStrength,
    pulseDuration,
    stdDevAcc,
    stdDevStr,
    appearance,
    subjectUNI,
    subjectUF,
    targetUNI,
    targetUF,
    isPulsing,
    isViableSubject,
  } = data;
  const hasDifferences =
    !!appearance &&
    ((targetUNI && targetUNI !== subjectUNI) ||
      (targetUF && targetUF !== subjectUF));
  return (
    <Section>
      <Stack align="center" g={0.5}>
        <Stack.Item>
          <Box color="label" mb={0.5}>
            Мощность
          </Box>
          <NumberInput
            animated
            tickWhileDragging
            width="64px"
            step={1}
            stepPixelSize={10}
            value={pulseStrength}
            minValue={1}
            maxValue={PULSE_STRENGTH_MAX}
            onChange={(value) => act('set_pulse_strength', { val: value })}
          />
        </Stack.Item>
        <Stack.Item>
          <Box color="label" mb={0.5}>
            Длительность
          </Box>
          <NumberInput
            animated
            tickWhileDragging
            width="80px"
            unit="с"
            step={1}
            stepPixelSize={10}
            value={pulseDuration}
            minValue={1}
            maxValue={PULSE_DURATION_MAX}
            onChange={(value) => act('set_pulse_duration', { val: value })}
          />
        </Stack.Item>
        <Stack.Item>
          <Box color="label" mb={0.5}>
            Все отличия
          </Box>
          <Button
            icon="radiation"
            disabled={!isViableSubject || isPulsing || !hasDifferences}
            tooltip="Облучить отличающиеся позиции базовой и видовой ДНК обычными случайными импульсами."
            onClick={() =>
              act('makeup_pulse_differences', {
                subject_ref: appearance.subject_ref,
                target_ref: appearance.target_ref,
              })
            }
          >
            Облучить
          </Button>
        </Stack.Item>
        <Stack.Item grow textAlign="right">
          <Box mb={0.5}>
            <Box inline color="label">
              Точность:{' '}
            </Box>
            {stdDevAcc}
          </Box>
          <Box color="label">
            68%: ±{stdDevStr} · 95%: ±{stdDevStr * 2}
          </Box>
        </Stack.Item>
      </Stack>
    </Section>
  );
};

const PulseBoard = (props) => {
  const { act } = useBackend();
  const { subjectBlock = [], targetBlock, type, name } = props;
  // Build blocks of buttons of unique enzymes
  const blocks = [];
  let buffer = [];
  for (let i = 0; i < subjectBlock.length; i++) {
    const char = subjectBlock.charAt(i);
    // Push a button into the buffer
    const button = (
      <Button
        fluid
        key={i}
        textAlign="center"
        content={char}
        color={
          targetBlock &&
          subjectBlock.slice(i - (i % 3), i - (i % 3) + 3) !==
            targetBlock.slice(i - (i % 3), i - (i % 3) + 3)
            ? 'good'
            : undefined
        }
        tooltip={
          targetBlock
            ? `Цель: ${targetBlock.slice(i - (i % 3), i - (i % 3) + 3)}`
            : undefined
        }
        onClick={() =>
          act('makeup_pulse', {
            index: i + 1,
            type: type,
          })
        }
      />
    );
    buffer.push(button);
    // Create a block from the current buffer
    if (buffer.length >= 3) {
      const block = (
        <Box inline width="22px" mx="1px">
          {buffer}
        </Box>
      );
      blocks.push(block);
      // Clear the buffer
      buffer = [];
    }
  }
  return (
    <Section fill scrollable title={`Unique ${name}`} position="relative">
      <Tabs fluid mb={1}>
        <Tabs.Tab
          selected={type === 'ui'}
          onClick={() => act('set_view', { consoleMode: CONSOLE_MODE_ENZYMES })}
        >
          Базовая ДНК
        </Tabs.Tab>
        <Tabs.Tab
          selected={type === 'uf'}
          onClick={() =>
            act('set_view', { consoleMode: CONSOLE_MODE_FEATURES })
          }
        >
          Видовая ДНК
        </Tabs.Tab>
      </Tabs>
      <Box mx="-1px">{blocks}</Box>
    </Section>
  );
};

export const DnaConsoleEnzymes = (props) => {
  const { data } = useBackend();
  const { isScannerConnected } = data;
  const { subjectBlock, targetBlock, type, name } = props;
  if (!isScannerConnected) {
    return <Section color="bad">DNA Scanner is not connected.</Section>;
  }
  return (
    <>
      <PulseSettings />
      <div className="DnaConsoleMakeup">
        <DnaConsoleAppearance />
        <PulseBoard
          subjectBlock={subjectBlock}
          targetBlock={targetBlock}
          type={type}
          name={name}
        />
      </div>
      <GeneticMakeupBuffers />
    </>
  );
};
