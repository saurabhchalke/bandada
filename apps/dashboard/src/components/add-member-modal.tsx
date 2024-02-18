import { getSemaphoreContract } from "@bandada/utils"
import {
    Box,
    Button,
    Heading,
    Modal,
    ModalBody,
    ModalContent,
    ModalOverlay,
    Text,
    Input,
    useClipboard
} from "@chakra-ui/react"
import { useCallback, useEffect, useState } from "react"
import { useSigner } from "wagmi"
import * as bandadaAPI from "../api/bandadaAPI"
import { Group } from "../types"
import parseMemberIds from "../utils/parseMemberIds"
import { Identity } from "@semaphore-protocol/identity"

export type AddMemberModalProps = {
    isOpen: boolean
    onClose: (value?: string[]) => void
    group: Group
}

export default function AddMemberModal({
    isOpen,
    onClose,
    group
}: AddMemberModalProps): JSX.Element {
    const [_memberIds, setMemberIds] = useState<string>("")
    const [_isLoading, setIsLoading] = useState(false)
    const {
        hasCopied,
        value: _clientLink,
        setValue: setClientLink,
        onCopy
    } = useClipboard("")
    const { data: signer } = useSigner()

    useEffect(() => {
        setMemberIds("")

        if (group.credentials) {
            setClientLink(
                `${import.meta.env.VITE_CLIENT_URL}?credentialGroupId=${
                    group.id
                }`
            )
        }
    }, [group, setClientLink])

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const text = e.target?.result as string
                const match = text.match(/D[0-9A-F]{62}/)
                if (match) {
                    const identity = new Identity(match[0])
                    const commitment = identity.getCommitment().toString()
                    console.log("commitment", commitment)
                    setMemberIds(commitment)
                }
            }
            reader.readAsText(file)
        }
    }

    const addMember = useCallback(async () => {
        const memberIds = parseMemberIds(_memberIds)
        if (memberIds.length === 0) {
            alert("Please enter at least one sensor id!")
            return
        }

        const uniqueMemberIds = new Set(memberIds)
        if (uniqueMemberIds.size !== memberIds.length) {
            alert("Please ensure there are no repeated member IDs!")
            return
        }

        const confirmMessage = `
Are you sure you want to add the following sensor?
${memberIds.join("\n")}
        `

        if (!window.confirm(confirmMessage)) {
            return
        }

        setIsLoading(true)

        if (group.type === "off-chain") {
            if ((await bandadaAPI.addMembers(group.id, memberIds)) === null) {
                setIsLoading(false)
                return
            }

            setIsLoading(false)
            onClose(memberIds)
        } else {
            if (!signer) {
                alert("No valid signer for your transaction!")

                setIsLoading(false)
                return
            }

            try {
                const semaphore = getSemaphoreContract("goerli", signer as any)

                await semaphore.addMembers(group.name, memberIds)

                setIsLoading(false)
                onClose(memberIds)
            } catch (error) {
                alert(
                    "Some error occurred! Check if you're on Goerli network and the transaction is signed and completed"
                )

                setIsLoading(false)
            }
        }
    }, [onClose, _memberIds, group, signer])

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            closeOnOverlayClick={false}
            isCentered
        >
            <ModalOverlay />
            <ModalContent bgColor="balticSea.50" maxW="450px">
                <ModalBody p="25px 30px">
                    <Heading fontSize="25px" fontWeight="500" mb="25px" as="h1">
                        New Sensor Device
                    </Heading>

                    {!group.credentials && (
                        <Box mb="5px">
                            <Text my="10px" color="balticSea.800">
                                Register new sensor device
                            </Text>

                            <Input
                                type="file"
                                accept=".txt"
                                onChange={handleFileChange}
                                my="10px"
                            />

                            <Button
                                my="10px"
                                width="100%"
                                variant="solid"
                                colorScheme="tertiary"
                                onClick={addMember}
                                isLoading={_isLoading}
                            >
                                Add sensor device
                            </Button>
                        </Box>
                    )}

                </ModalBody>
            </ModalContent>
        </Modal>
    )
}
