import { Controller } from 'react-hook-form';
import { Group, Title, Text, useMantineColorScheme, Flex, Code, Stack } from '@mantine/core';

import { colors } from '@config';
import { Button } from '@ui/button';
import { Editor } from '@ui/editor/Editor';
import { useEditor } from '@hooks/useEditor';

import { Alert } from '@ui/Alert';
import { VarLabel } from './VarLabel';
import { VarItemWrapper } from './VarItemWrapper';
import { WarningIcon } from '@assets/icons/Warning.icon';
import { InformationIcon } from '@assets/icons/Information.icon';
import { PossibleJSONErrors } from '@components/common/PossibleJsonErrors';

interface OutputEditorProps {
  templateId: string;
}

export function OutputEditor({ templateId }: OutputEditorProps) {
  const { colorScheme } = useMantineColorScheme();
  const { customization, control, errors, onSaveClick, syncCustomization, isSyncCustomizationLoading } = useEditor({
    templateId,
  });

  return (
    <Stack spacing="sm">
      <Group position="apart">
        <div>
          <Title color={colorScheme === 'dark' ? colors.white : colors.black} order={4}>
            Customize how you want to get data
          </Title>
          <Text fw="normal" color={colors.TXTSecondaryDark}>
            Customize the format of how data will be sent to your destination.
          </Text>
        </div>

        <Button onClick={onSaveClick}>Save</Button>
      </Group>
      <Alert icon={<InformationIcon size="sm" />} p="xs">
        <Code>{`%<var>%`}</Code> will be used to loop over data items.
      </Alert>
      {customization?.isCombinedFormatUpdated && (
        <Alert p="xs" color="red" icon={<WarningIcon size="sm" />}>
          <Flex align="center" justify="space-between">
            Format is updated manually. The update in schema will not reflact automatically in output.
            <Button size="xs" onClick={syncCustomization} loading={isSyncCustomizationLoading}>
              Sync Again
            </Button>
          </Flex>
        </Alert>
      )}
      <Flex gap="xs">
        <div style={{ width: '80%' }}>
          <Controller
            control={control}
            name="combinedFormat"
            render={({ field }) => (
              <Editor
                name="combinedFormat"
                id="combined-format"
                value={field.value}
                onChange={field.onChange}
                variables={[...(customization?.recordVariables || []), ...(customization?.chunkVariables || [])]}
              />
            )}
          />
          {errors.combinedFormat?.message && <Text color="red">{errors.combinedFormat.message}</Text>}
          {errors.combinedFormat?.type === 'JSON' && <PossibleJSONErrors />}
        </div>
        <div style={{ width: '20%', display: 'flex', flexDirection: 'column', gap: '5' }}>
          <VarLabel label="System Variables">
            {customization?.chunkVariables.map((variable) => (
              <VarItemWrapper key={variable} name={variable} copyText={'"' + variable + '"'} />
            ))}
          </VarLabel>
          <VarLabel label="Schema Variables">
            {customization?.recordVariables.map((variable) => (
              <VarItemWrapper key={variable} name={variable} copyText={'"' + variable + '"'} />
            ))}
          </VarLabel>
        </div>
      </Flex>
    </Stack>
  );
}
