import React, { useCallback, useMemo, useRef, useState } from "react"
import Cropper from "react-easy-crop"
import { cn } from "@/shared/shadcn/lib/utils"
import { Button } from "@/shared/shadcn/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/shadcn/ui/dialog"
import { Slider } from "@/shared/shadcn/ui/slider"
import { Trash2, Upload, Image as ImageIcon } from "lucide-react"

type AvatarPickerProps = {
    value: File | null
    onChange: (file: File | null) => void
    accept?: string
    maxSizeMb?: number
    className?: string
    error?: string
    helper?: string
}

type Area = { x: number; y: number; width: number; height: number }

function fileToDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

async function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener("load", () => resolve(image))
        image.addEventListener("error", reject)
        image.crossOrigin = "anonymous"
        image.src = url
    })
}

// ✅ getRadianAngle удалена — была объявлена но нигде не использовалась (TS6133)

async function cropToBlob(imageSrc: string, pixelCrop: Area, mime = "image/webp", quality = 0.92) {
    const image = await createImage(imageSrc)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas not supported")

    canvas.width = Math.round(pixelCrop.width)
    canvas.height = Math.round(pixelCrop.height)

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    )

    const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
            mime,
            quality
        )
    })
    return blob
}

export function AvatarPicker({
                                 value,
                                 onChange,
                                 accept = "image/png,image/jpeg,image/webp",
                                 maxSizeMb = 5,
                                 className,
                                 error,
                                 helper,
                             }: AvatarPickerProps) {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [localError, setLocalError] = useState<string>("")
    const [previewUrl, setPreviewUrl] = useState<string>("")
    const [cropOpen, setCropOpen] = useState(false)

    const [imageSrc, setImageSrc] = useState<string>("")
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

    const shownError = error || localError

    const currentPreview = useMemo(() => {
        if (previewUrl) return previewUrl
        if (!value) return ""
        return URL.createObjectURL(value)
    }, [value, previewUrl])

    const validateFile = (file: File) => {
        if (!file.type.startsWith("image/")) return "Це не зображення."
        const maxBytes = maxSizeMb * 1024 * 1024
        if (file.size > maxBytes) return `Файл завеликий (макс. ${maxSizeMb} МБ).`
        return ""
    }

    const pick = () => inputRef.current?.click()

    const handleSelectedFile = async (file: File) => {
        const v = validateFile(file)
        if (v) {
            setLocalError(v)
            return
        }
        setLocalError("")

        const dataUrl = await fileToDataUrl(file)
        setImageSrc(dataUrl)
        setZoom(1)
        setCrop({ x: 0, y: 0 })
        setCroppedAreaPixels(null)
        setCropOpen(true)
    }

    const onInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        await handleSelectedFile(file)
        e.target.value = ""
    }

    const onDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        const file = e.dataTransfer.files?.[0]
        if (!file) return
        await handleSelectedFile(file)
    }

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
        setCroppedAreaPixels(areaPixels)
    }, [])

    const applyCrop = useCallback(async () => {
        if (!imageSrc || !croppedAreaPixels) {
            setCropOpen(false)
            return
        }

        const blob = await cropToBlob(imageSrc, croppedAreaPixels, "image/webp", 0.92)
        const file = new File([blob], "avatar.webp", { type: "image/webp" })

        if (previewUrl) URL.revokeObjectURL(previewUrl)
        const nextPreview = URL.createObjectURL(file)
        setPreviewUrl(nextPreview)

        onChange(file)
        setCropOpen(false)
    }, [croppedAreaPixels, imageSrc, onChange, previewUrl])

    const clear = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl("")
        setLocalError("")
        onChange(null)
    }

    return (
        <div className={cn("grid gap-2", className)}>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={onInputChange}
            />

            <div
                className={cn(
                    "rounded-xl border border-dashed p-4 transition-colors",
                    "hover:bg-muted/30",
                    shownError ? "border-destructive/60" : "border-border/70"
                )}
                onDrop={onDrop}
                onDragOver={onDragOver}
                role="button"
                tabIndex={0}
                onClick={pick}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? pick() : null)}
            >
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
                        {currentPreview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={currentPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                        ) : (
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="text-sm font-medium flex items-center gap-2">
                            <Upload className="h-4 w-4 text-muted-foreground" />
                            Завантажити аватар
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Перетягни файл сюди або натисни, щоб обрати
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button type="button" variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); pick() }}>
                            Обрати
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); clear() }}
                            disabled={!value && !previewUrl}
                            aria-label="Прибрати"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
            {shownError && <p className="text-xs text-destructive">{shownError}</p>}

            <Dialog open={cropOpen} onOpenChange={setCropOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Обрізка аватара</DialogTitle>
                    </DialogHeader>

                    <div className="relative w-full h-[320px] rounded-lg overflow-hidden bg-black/90">
                        {imageSrc && (
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
                                showGrid={false}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        )}
                    </div>

                    <div className="grid gap-2">
                        <div className="text-xs text-muted-foreground">Масштаб</div>
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.01}
                            onValueChange={(v) => setZoom(v[0] ?? 1)}
                        />
                    </div>

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="secondary" onClick={() => setCropOpen(false)}>
                            Скасувати
                        </Button>
                        <Button type="button" onClick={applyCrop}>
                            Застосувати
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}